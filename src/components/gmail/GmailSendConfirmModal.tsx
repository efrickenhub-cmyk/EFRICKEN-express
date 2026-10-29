import React, { useState } from 'react';
import { Mail, AlertTriangle, Send, X, CheckCircle2, ShieldCheck, Loader2 } from 'lucide-react';
import {
  sendGmailMessage,
  SendEmailPayload,
} from '../../services/gmailService';
import { getValidAccessToken, signInWithGoogle, auth } from '../../services/googleAuth';

interface GmailSendConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  defaultRecipient: string;
  defaultSubject: string;
  defaultHtmlBody: string;
  trackingNumber?: string;
  recipientRole?: 'sender' | 'consignee' | 'support';
}

export const GmailSendConfirmModal: React.FC<GmailSendConfirmModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  defaultRecipient,
  defaultSubject,
  defaultHtmlBody,
  trackingNumber,
  recipientRole = 'consignee',
}) => {
  const [recipient, setRecipient] = useState(defaultRecipient);
  const [subject, setSubject] = useState(defaultSubject);
  const [additionalNote, setAdditionalNote] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentUser = auth.currentUser;
  const senderEmail = currentUser?.email || 'efrickenhub@gmail.com';

  const handleSend = async () => {
    if (!recipient.trim() || !recipient.includes('@')) {
      setError('Please provide a valid recipient email address.');
      return;
    }

    setIsSending(true);
    setError(null);

    try {
      // 1. Ensure valid access token in memory
      let token = await getValidAccessToken();
      if (!token) {
        // Prompt Google Sign in
        const authResult = await signInWithGoogle();
        token = authResult.accessToken;
      }

      // 2. Prepare payload with any additional dispatcher note
      let finalHtml = defaultHtmlBody;
      if (additionalNote.trim()) {
        const noteBlock = `
          <div style="background-color: #f8fafc; border-left: 4px solid #f59e0b; padding: 12px; margin: 16px 0; border-radius: 4px; font-size: 14px;">
            <strong style="color: #0f172a;">Courier Dispatch Note:</strong>
            <p style="margin: 4px 0 0; color: #334155;">${additionalNote.replace(/\n/g, '<br>')}</p>
          </div>
        `;
        // Insert before footer or at end of content
        if (finalHtml.includes('</div>\n    <div class="footer">')) {
          finalHtml = finalHtml.replace('</div>\n    <div class="footer">', `${noteBlock}</div>\n    <div class="footer">`);
        } else {
          finalHtml += noteBlock;
        }
      }

      const payload: SendEmailPayload = {
        to: recipient.trim(),
        subject: subject.trim(),
        htmlBody: finalHtml,
        fromName: 'Efricken Express Logistics',
      };

      // 3. Send via Gmail REST API
      await sendGmailMessage(payload, token, senderEmail, trackingNumber);

      setIsSent(true);
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 1500);
    } catch (err: any) {
      console.error('Failed to send email via Gmail:', err);
      setError(err.message || 'Failed to dispatch email via Gmail API. Please verify account permissions.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base flex items-center gap-2">
                Send Notification via Gmail
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-normal">
                  OAuth Confirmed
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Waybill Reference: <strong className="text-white">{trackingNumber || 'General Notice'}</strong>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* Safety Notice Mandate */}
          <div className="flex items-start gap-3 p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900">
            <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold text-amber-950">User Confirmation Required:</strong>
              <p className="mt-0.5">
                This action will send an authentic email through your connected Google Workspace / Gmail account (<strong>{senderEmail}</strong>) directly to the recipient. Review the details below before confirming.
              </p>
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2.5 p-3 bg-red-50 rounded-lg border border-red-200 text-xs text-red-700">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
              <div>
                <strong>Dispatch Error:</strong> {error}
              </div>
            </div>
          )}

          {isSent && (
            <div className="flex items-center gap-2.5 p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-sm text-emerald-800 font-semibold">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Email successfully dispatched via Gmail API!</span>
            </div>
          )}

          {/* Form Fields */}
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">From (Connected Gmail)</label>
                <div className="px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-600 font-mono truncate">
                  {senderEmail}
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  To (Recipient {recipientRole})
                </label>
                <input
                  type="email"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  placeholder="recipient@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Optional Courier Notes (Appended to message)
              </label>
              <textarea
                value={additionalNote}
                onChange={(e) => setAdditionalNote(e.target.value)}
                rows={2}
                placeholder="E.g., Rider John is approaching Tsavo Rd; please have national ID ready."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>

            {/* Email Preview */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                <span>Email Content Preview:</span>
                <span className="text-[10px] text-slate-500">HTML logistics template</span>
              </label>
              <div className="border border-slate-200 rounded-xl p-3 bg-slate-50 max-h-48 overflow-y-auto text-xs">
                <div
                  className="prose prose-sm max-w-none pointer-events-none"
                  dangerouslySetInnerHTML={{ __html: defaultHtmlBody }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3.5 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            disabled={isSending}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 transition cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSend}
            disabled={isSending || isSent}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-md transition disabled:opacity-50 cursor-pointer active:scale-95"
          >
            {isSending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Sending via Gmail...</span>
              </>
            ) : isSent ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-900" />
                <span>Sent!</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Confirm & Send via Gmail</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
