/**
 * User interaction with notice
 * @author     Nathan Nguyen <nathannguyen@catalyst-au.net>
 * @copyright  Catalyst IT
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

define(
    ['jquery', 'core/ajax', 'local_sitenotice/modal_notice'],
    function ($, ajax, ModalNotice) {

        var notices = {};
        var modal;
        var viewednotices = [];

        var SiteNotice = {};

        /**
         * Retrieved notice which has not been viewwed.
         * @returns {boolean|*}
         */
        var getNotice = function() {
            for (var i in notices) {
                // Check the notice has been viewed.
                if (!viewednotices.includes(i)) {
                    viewednotices.push(i);
                    return notices[i];
                }
            }
            return false;
        };

        /**
         * Show next notice in the modal.
         */
        var nextNotice = function () {
            var nextnotice = getNotice();
            if (nextnotice == false) {
                return;
            }
            if (typeof modal === 'undefined') {
                ModalNotice.create({
                    title: nextnotice.title,
                    body: nextnotice.content,
                    large: true,
                })
                .then(function (newmodal) {
                    modal = newmodal;

                    modal.setNoticeId(nextnotice.id);
                    modal.setRequiredAcknowledgement(nextnotice.reqack);

                    // Event listener for close button.
                    modal.getModal().on('click', modal.getCloseButtonID(), function() {
                        dismissNotice();
                        modal.hide();
                    });
                    // Event listener for accept button.
                    modal.getModal().on('click', modal.getAcceptButtonID(), function() {
                        acknowledgeNotice();
                        modal.hide();
                    });
                    // Event listener for link tracking.
                    modal.getModal().on('click', 'a', function() {
                        var linkid = $(this).attr("data-linkid");
                        trackLink(linkid);
                    });
                    // Event listener for ack checkbox.
                    modal.getModal().on('click', modal.getAckCheckboxID(), function() {
                        var ischecked = $(modal.getAckCheckboxID()).is(":checked");
                        $(modal.getAcceptButtonID()).attr('disabled', !ischecked);
                        if (!ischecked) {
                            modal.turnonToolTip();
                        } else {
                            modal.turnoffToolTip();
                        }
                    });

                    modal.show();
                    modal.getModal().focus();
                });
            } else {
                // Update with new details.
                modal.setTitle(nextnotice.title);
                modal.setBody(nextnotice.content);
                modal.setNoticeId(nextnotice.id);
                modal.setRequiredAcknowledgement(nextnotice.reqack);
                modal.show();
                modal.getModal().focus();
            }
        };

        /**
         * Dismiss Notice.
         */
        var dismissNotice = function () {
            var noticeid = modal.getNoticeId();
            var promises = ajax.call([
                { methodname: 'local_sitenotice_dismiss', args: { noticeid: noticeid} }
            ]);

            promises[0].done(function(response) {
                if(response.redirecturl) {
                    window.open(response.redirecturl,"_parent", "");
                } else {
                    nextNotice();
                }
            }).fail(function(ex) {
                // TODO: Log fail event.
                this.console.log(ex);
            });
        };

        /**
         * Acknowledge notice.
         */
        var acknowledgeNotice = function () {
            var noticeid = modal.getNoticeId();
            var promises = ajax.call([
                { methodname: 'local_sitenotice_acknowledge', args: { noticeid: noticeid} }
            ]);

            promises[0].done(function(response) {
                if(response.redirecturl) {
                    window.open(response.redirecturl,"_parent", "");
                } else {
                    nextNotice();
                }
            }).fail(function(ex) {
                // TODO: Log fail event.
                this.console.log(ex);
            });
        };

        /**
         * Link tracking.
         * @param {Integer} linkid
         */
        var trackLink = function (linkid) {
            var promises = ajax.call([
                { methodname: 'local_sitenotice_tracklink', args: {linkid: linkid} }
            ]);

            promises[0].done(function(response) {
                if(response.redirecturl) {
                    window.open(response.redirecturl,"_parent", "");
                }
            }).fail(function(ex) {
                this.console.log(ex);
            });
        };

        /**
         * Initial Modal with user notices.
         */
        SiteNotice.init = function() {
            var promises = ajax.call([
                { methodname: 'local_sitenotice_getnotices', args: {} }
            ]);

            promises[0].done(function(response) {
                notices = JSON.parse(response.notices);
                $(document).ready(function() {
                    nextNotice();
                });
            }).fail(function(ex) {
                this.console.log(ex);
            });
        };

        return SiteNotice;
    }
);