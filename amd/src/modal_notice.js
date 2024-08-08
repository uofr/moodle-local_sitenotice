/**
 * Notice modal.
 * @author     Nathan Nguyen <nathannguyen@catalyst-au.net>
 * @copyright  Catalyst IT
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

import $ from 'jquery';
import Notification from 'core/notification';
import Modal from 'core/modal';
import KeyCodes from 'core/key_codes';
import {getString} from 'core/str';

const SELECTORS = {
    CLOSE_BUTTON: '[data-action="close"]',
    ACCEPT_BUTTON: '[data-action="accept"]',
    ACK_CHECKBOX: 'sitenotice-modal-ackcheckbox',
    CAN_RECEIVE_FOCUS: 'input:not([type="hidden"]), a[href], button:not([disabled])',
    TOOL_TIP_WRAPPER: '#tooltip-wrapper',
};

const ATTRIBUTE = {
    NOTICE_ID: 'data-noticeid',
    REQUIRED_ACKNOWLEDGE: 'data-noticereqack',
};

export default class ModalNotice extends Modal {
    static TYPE = 'local_sitenotice/modal_notice';

    static TEMPLATE = 'local_sitenotice/modal_notice';

    constructor(root) {
        super(root);

        if (!this.getFooter().find(SELECTORS.CLOSE_BUTTON).length) {
            Notification.exception({message: 'No close button found'});
        }

        if (!this.getFooter().find(SELECTORS.ACCEPT_BUTTON).length) {
            Notification.exception({message: 'No accept button found'});
        }
    }

    /**
     * Get ID of close button.
     * @returns {string}
     */
    getCloseButtonID() {
        return '#' + this.getFooter().find(SELECTORS.CLOSE_BUTTON).attr('id');
    }

    /**
     * Get ID of accept button.
     * @returns {string}
     */
    getAcceptButtonID() {
        return '#' + this.getFooter().find(SELECTORS.ACCEPT_BUTTON).attr('id');
    }

    /**
     * Get ID of accept button.
     * @returns {string}
     */
    getAckCheckboxID() {
        return '#' + SELECTORS.ACK_CHECKBOX;
    }

    /**
     * Set Notice ID to the current modal.
     * @param {Integer} noticeid
     */
    setNoticeId(noticeid) {
        this.getModal().attr(ATTRIBUTE.NOTICE_ID, noticeid);
    }

    /**
     * Get the current notice id.
     * @returns {*}
     */
    getNoticeId() {
        return this.getModal().attr(ATTRIBUTE.NOTICE_ID);
    }

    /**
     * Add Checkbox if the notice requires acknowledgement.
     * @param {Integer} reqack
     */
    setRequiredAcknowledgement(reqack) {
        const modal  = this;
        if (reqack == 1) {
            getString('modal:checkboxtext', 'local_sitenotice').then(function(langString) {
                const body = modal.getBody();
                const checkboxdiv = $("<div>", {});
                const ackcheckbox = $("<input>", {type: "checkbox", id: SELECTORS.ACK_CHECKBOX});
                const labelspan = $("<span>", {class: "checkboxlabel"});
                labelspan.append(langString);
                checkboxdiv.append(ackcheckbox);
                checkboxdiv.append(labelspan);
                body.append(checkboxdiv);
                const acceptbutton = modal.getFooter().find(SELECTORS.ACCEPT_BUTTON);
                acceptbutton.show();
                acceptbutton.attr('disabled', true);
                // Tooltip for disabled box.
                modal.getFooter().find(SELECTORS.TOOL_TIP_WRAPPER).tooltip();
            }).catch(Notification.exception);
        } else {
            this.getFooter().find(SELECTORS.ACCEPT_BUTTON).css('display', 'none');
        }
    }

    /**
     * Turn off tool tip
     */
    turnoffToolTip() {
        this.getFooter().find(SELECTORS.TOOL_TIP_WRAPPER).tooltip('disable');
    }

    /**
     * Turn on tool tip
     */
    turnonToolTip() {
        this.getFooter().find(SELECTORS.TOOL_TIP_WRAPPER).tooltip('enable');
    }

    /**
     * Remove escape key event.
     */
    registerEventListeners() {
        $(document).on('keydown', function(e) {
            if (!this.isVisible()) {
                return;
            }

            if (e.keyCode == KeyCodes.tab) {
                this.handleTabLock(e);
            }

        }.bind(this));

        $(document).on('mousedown', function(e) {
            if (!this.isVisible()) {
                return;
            }
            e.preventDefault();

        }.bind(this));
    }

    /**
     * CAN_RECEIVE_FOCUS in modal.js does not check if the disabled or hidden button
     * @param {Event} e
     */
    handleTabLock(e) {
        const target = $(document.activeElement);

        const focusableElements = this.modal.find(SELECTORS.CAN_RECEIVE_FOCUS).filter(":visible");
        const firstFocusable = focusableElements.first();
        const lastFocusable = focusableElements.last();

        let focusable = false;
        let previous = 0;
        let next = null;
        focusableElements.each(function(index) {
            if (target.is(this)) {
                focusable = true;
                previous = index;
            }
        });

        // Focus to first element.
        if (focusable == false) {
            e.preventDefault();
            firstFocusable.focus();
            return;
        } else {
            if (target.is(firstFocusable) && e.shiftKey) {
                lastFocusable.focus();
                e.preventDefault();
            } else if (target.is(lastFocusable) && !e.shiftKey) {
                firstFocusable.focus();
                e.preventDefault();
            } else {
                if (!e.shiftKey) {
                    next = focusableElements.get(previous+1);
                } else {
                    next = focusableElements.get(previous-1);
                }
                next.focus();
                e.preventDefault();
            }
        }
    }
}