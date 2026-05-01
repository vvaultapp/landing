/**
 * The 5 activation emails as inlined HTML, plus the subject line for
 * each. The bodies are taken verbatim from the React-Email exports
 * Edward provided — only `{{firstName}}` and `{{unsubscribeUrl}}` are
 * substituted at send time. Everything else (image URLs, app store
 * badge, tracking pixels in img tags, etc.) ships exactly as
 * authored, so a copy/paste preview from Resend matches what the
 * recipient actually sees.
 *
 * Subjects are derived from each email's `<h1>` so we don't have a
 * second source-of-truth that can drift from the body.
 */

export type TemplateKey =
  | "activation_1"
  | "activation_2"
  | "activation_3"
  | "activation_4"
  | "activation_5";

export type Template = {
  subject: string;
  /* Raw HTML; `{{firstName}}` and `{{unsubscribeUrl}}` get
     replaced via String.replaceAll at send time. */
  html: string;
};

const html_1 = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html dir="ltr" lang="en">
  <head>
    <meta content="width=device-width" name="viewport" />
    <link rel="preload" as="image" href="https://resend-attachments.s3.amazonaws.com/5f167b30-2e5c-4ad1-ae04-2fe01164febe" />
    <link rel="preload" as="image" href="https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Download_on_the_App_Store_Badge.svg/3840px-Download_on_the_App_Store_Badge.svg.png" />
    <link rel="preload" as="image" href="https://cdn.simpleicons.org/discord/5865F2" />
    <link rel="preload" as="image" href="https://cdn.simpleicons.org/instagram/E4405F" />
    <link rel="preload" as="image" href="https://cdn.simpleicons.org/youtube/FF0000" />
    <link rel="preload" as="image" href="https://cdn.simpleicons.org/tiktok/000000" />
    <link rel="preload" as="image" href="https://resend-attachments.s3.amazonaws.com/f7974fdb-3aa9-49d7-9745-2b1857a5a940" />
    <meta content="text/html; charset=UTF-8" http-equiv="Content-Type" />
    <meta name="x-apple-disable-message-reformatting" />
    <meta content="IE=edge" http-equiv="X-UA-Compatible" />
    <meta name="x-apple-disable-message-reformatting" />
    <meta content="telephone=no,address=no,email=no,date=no,url=no" name="format-detection" />
  </head>
  <body style="background-color:#ffffff">
    <!--$--><!--html--><!--head--><!--body-->
    <table border="0" width="100%" cellpadding="0" cellspacing="0" role="presentation" align="center">
      <tbody>
        <tr>
          <td style="background-color:#ffffff">
            <table align="left" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="max-width:600px;align:left;width:100%;color:#000000;background-color:#ffffff;padding-top:0px;padding-right:0px;padding-bottom:0px;padding-left:0px;border-radius:0px;border-color:#000000">
              <tbody>
                <tr style="width:100%">
                  <td>
                    <div style="margin:0;padding:0;display:none;overflow:hidden;line-height:1px;opacity:0;max-height:0;max-width:0">
                      <p style="margin:0;padding:0">Your preview text goes here.</p>
                    </div>
                    <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="margin-top:0;margin-right:auto;margin-bottom:0;margin-left:auto;padding-top:0;padding-right:0;padding-bottom:0;padding-left:0;background-color:#f8f8fa">
                      <tbody>
                        <tr style="margin:0;padding:0">
                          <td align="center" data-id="__react-email-column" style="margin:0;padding:0;background-color:#f8f8fa">
                            <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="margin-top:0;margin-right:auto;margin-bottom:0;margin-left:auto;padding-top:0;padding-right:0;padding-bottom:0;padding-left:0;max-width:600px;width:100%;background-color:#f8f8fa">
                              <tbody>
                                <tr style="margin:0;padding:0">
                                  <td align="left" data-id="__react-email-column" style="margin:0;padding:38px 18px 24px 18px">
                                    <img alt="vvault" height="auto" src="https://resend-attachments.s3.amazonaws.com/5f167b30-2e5c-4ad1-ae04-2fe01164febe" style="display:block;outline:none;border:0;text-decoration:none;max-width:100%;width:92px;height:auto" width="92" />
                                  </td>
                                </tr>
                                <tr style="margin:0;padding:0">
                                  <td data-id="__react-email-column" style="margin:0;padding:0 18px">
                                    <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="margin-top:0;margin-right:0;margin-bottom:0;margin-left:0;padding-top:0;padding-right:0;padding-bottom:0;padding-left:0;width:100%;background:#f1f1f5;border-radius:18px;border-collapse:separate">
                                      <tbody>
                                        <tr style="margin:0;padding:0">
                                          <td data-id="__react-email-column" style="margin:0;padding:32px 28px 28px 28px">
                                            <h1 style="margin:0 0 24px 0;padding:0;font-size:26px;line-height:1.25;color:#0a0a0a;font-family:Arial,Helvetica,sans-serif;font-weight:700">Still empty</h1>
                                            <p style="margin:0 0 20px 0;padding:0;font-size:15px;line-height:1.5;color:#242424;font-family:Arial,Helvetica,sans-serif">Hey {{firstName}},</p>
                                            <p style="margin:0 0 20px 0;padding:0;font-size:15px;line-height:1.5;color:#242424;font-family:Arial,Helvetica,sans-serif">Saw you signed up but haven&#x27;t dropped anything in yet. Just figured I&#x27;d check in. The thing <strong>only really clicks</strong> once you upload 2 or 3 tracks and send them somewhere. Once that happens you start seeing <strong>who opened, who played, who downloaded, all that.</strong></p>
                                            <p style="margin:0 0 20px 0;padding:0;font-size:15px;line-height:1.5;color:#242424;font-family:Arial,Helvetica,sans-serif">Takes about a minute. If your stuff is sitting in a folder somewhere, hit reply and tell me what you&#x27;ve got. I&#x27;ll help you sort it.</p>
                                            <p style="margin:0;padding:0;font-size:15px">Edward, from vvault</p>
                                            <p style="margin:0;padding:0"><br /></p>
                                            <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="margin-top:8px;margin-right:0;margin-bottom:0;margin-left:0;padding-top:0;padding-right:0;padding-bottom:0;padding-left:0;border-collapse:collapse">
                                              <tbody>
                                                <tr style="margin:0;padding:0">
                                                  <td align="left" data-id="__react-email-column" style="margin:0;padding:0">
                                                    <p style="margin:0;padding:0"><a href="https://vvault.app/library" rel="noopener noreferrer nofollow" style="color:#ffffff;text-decoration-line:none;text-decoration:none;display:inline-block;padding:12px 24px;background:#000000;border-radius:10px;font-weight:700;font-size:15px;line-height:1;font-family:Arial,Helvetica,sans-serif" target="_blank">Drop your first tracks</a></p>
                                                  </td>
                                                </tr>
                                              </tbody>
                                            </table>
                                          </td>
                                        </tr>
                                      </tbody>
                                    </table>
                                  </td>
                                </tr>
                                <tr style="margin:0;padding:0">
                                  <td align="center" data-id="__react-email-column" style="margin:0;padding:32px 18px 0 18px">
                                    <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                                      <tbody style="width:100%">
                                        <tr style="width:100%">
                                          <td align="center" data-id="__react-email-column">
                                            <a href="https://apps.apple.com/us/app/vvault/id6759256796" style="color:#067df7;text-decoration-line:none" target="_blank"><img alt="Download on the App Store" height="44" src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Download_on_the_App_Store_Badge.svg/3840px-Download_on_the_App_Store_Badge.svg.png" style="display:block;outline:none;border:0;text-decoration:none;max-width:100%;height:44px;width:auto" width="148" /></a>
                                          </td>
                                        </tr>
                                      </tbody>
                                    </table>
                                  </td>
                                </tr>
                                <tr style="margin:0;padding:0">
                                  <td align="center" data-id="__react-email-column" style="margin:0;padding:28px 32px 0 32px;color:#6f6f78;font-size:12px;line-height:1.4;font-family:Arial,Helvetica,sans-serif;text-align:center">
                                    <p style="margin:0 0 18px 0;padding:0">You received this email because you signed up for vvault. You can unsubscribe at any time.</p>
                                    <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="margin-top:0;margin-right:auto;margin-bottom:26px;margin-left:auto;padding-top:0;padding-right:0;padding-bottom:0;padding-left:0;border-collapse:collapse">
                                      <tbody>
                                        <tr style="margin:0;padding:0">
                                          <td data-id="__react-email-column" style="margin:0;padding:0 12px"><a href="https://discord.gg/HNBur5zKp" style="color:#067df7;text-decoration-line:none" target="_blank"><img alt="Discord" height="32" src="https://cdn.simpleicons.org/discord/5865F2" style="display:block;outline:none;border:0;text-decoration:none;max-width:100%;width:32px;height:32px;opacity:0.8" width="32" /></a></td>
                                          <td data-id="__react-email-column" style="margin:0;padding:0 12px"><a href="https://instagram.com/vvault.app" style="color:#067df7;text-decoration-line:none" target="_blank"><img alt="Instagram" height="32" src="https://cdn.simpleicons.org/instagram/E4405F" style="display:block;outline:none;border:0;text-decoration:none;max-width:100%;width:32px;height:32px;opacity:0.8" width="32" /></a></td>
                                          <td data-id="__react-email-column" style="margin:0;padding:0 12px"><a href="https://youtube.com/@vvaultapp" style="color:#067df7;text-decoration-line:none" target="_blank"><img alt="YouTube" height="32" src="https://cdn.simpleicons.org/youtube/FF0000" style="display:block;outline:none;border:0;text-decoration:none;max-width:100%;width:32px;height:32px;opacity:0.8" width="32" /></a></td>
                                          <td data-id="__react-email-column" style="margin:0;padding:0 12px"><a href="https://www.tiktok.com/@vvault.app" style="color:#067df7;text-decoration-line:none" target="_blank"><img alt="TikTok" height="32" src="https://cdn.simpleicons.org/tiktok/000000" style="display:block;outline:none;border:0;text-decoration:none;max-width:100%;width:32px;height:32px;opacity:0.8" width="32" /></a></td>
                                        </tr>
                                      </tbody>
                                    </table>
                                    <p style="margin:0 0 14px 0;padding:0"><a href="https://vvault.app/privacy" rel="noopener noreferrer nofollow" style="color:#6f6f78;text-decoration-line:none;text-decoration:none" target="_blank">Privacy</a><span><span style="padding:0 6px">|</span></span><a href="https://vvault.app/terms" rel="noopener noreferrer nofollow" style="color:#6f6f78;text-decoration-line:none;text-decoration:none" target="_blank">Terms</a><span><span style="padding:0 6px">|</span></span><a href="mailto:edward@vvault.app" rel="noopener noreferrer nofollow" style="color:#6f6f78;text-decoration-line:none;text-decoration:none" target="_blank">Contact</a></p>
                                    <p style="margin:0 0 24px 0;padding:0"><a href="{{unsubscribeUrl}}" rel="noopener noreferrer nofollow" style="color:#6f6f78;text-decoration-line:none;text-decoration:none" target="_blank">Unsubscribe</a></p>
                                    <div style="margin:0;padding:0;height:96px;overflow:hidden;text-align:center">
                                      <img alt="vvault" height="auto" src="https://resend-attachments.s3.amazonaws.com/f7974fdb-3aa9-49d7-9745-2b1857a5a940" style="display:inline-block;outline:none;border:0;text-decoration:none;max-width:100%;width:560px;height:auto;margin-top:30px;opacity:0.08" width="560" />
                                    </div>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                    <p style="margin:0;padding:0"><br /></p>
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
    <!--/$-->
  </body>
</html>`;

const html_2 = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html dir="ltr" lang="en">
  <head>
    <meta content="width=device-width" name="viewport" />
    <link rel="preload" as="image" href="https://resend-attachments.s3.amazonaws.com/5f167b30-2e5c-4ad1-ae04-2fe01164febe" />
    <link rel="preload" as="image" href="https://resend-attachments.s3.amazonaws.com/273856cb-f264-40f5-a76a-33034596f9fe" />
    <link rel="preload" as="image" href="https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Download_on_the_App_Store_Badge.svg/3840px-Download_on_the_App_Store_Badge.svg.png" />
    <link rel="preload" as="image" href="https://cdn.simpleicons.org/discord/5865F2" />
    <link rel="preload" as="image" href="https://cdn.simpleicons.org/instagram/E4405F" />
    <link rel="preload" as="image" href="https://cdn.simpleicons.org/youtube/FF0000" />
    <link rel="preload" as="image" href="https://cdn.simpleicons.org/tiktok/000000" />
    <link rel="preload" as="image" href="https://resend-attachments.s3.amazonaws.com/f7974fdb-3aa9-49d7-9745-2b1857a5a940" />
    <meta content="text/html; charset=UTF-8" http-equiv="Content-Type" />
    <meta name="x-apple-disable-message-reformatting" />
    <meta content="IE=edge" http-equiv="X-UA-Compatible" />
    <meta name="x-apple-disable-message-reformatting" />
    <meta content="telephone=no,address=no,email=no,date=no,url=no" name="format-detection" />
  </head>
  <body style="background-color:#ffffff">
    <!--$--><!--html--><!--head--><!--body-->
    <table border="0" width="100%" cellpadding="0" cellspacing="0" role="presentation" align="center">
      <tbody>
        <tr>
          <td style="background-color:#ffffff">
            <table align="left" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="max-width:600px;align:left;width:100%;color:#000000;background-color:#ffffff;padding-top:0px;padding-right:0px;padding-bottom:0px;padding-left:0px;border-radius:0px;border-color:#000000">
              <tbody>
                <tr style="width:100%">
                  <td>
                    <div style="margin:0;padding:0;display:none;overflow:hidden;line-height:1px;opacity:0;max-height:0;max-width:0">
                      <p style="margin:0;padding:0">Your preview text goes here.</p>
                    </div>
                    <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="margin-top:0;margin-right:auto;margin-bottom:0;margin-left:auto;padding-top:0;padding-right:0;padding-bottom:0;padding-left:0;background-color:#f8f8fa">
                      <tbody>
                        <tr style="margin:0;padding:0">
                          <td align="center" data-id="__react-email-column" style="margin:0;padding:0;background-color:#f8f8fa">
                            <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="margin-top:0;margin-right:auto;margin-bottom:0;margin-left:auto;padding-top:0;padding-right:0;padding-bottom:0;padding-left:0;max-width:600px;width:100%;background-color:#f8f8fa">
                              <tbody>
                                <tr style="margin:0;padding:0">
                                  <td align="left" data-id="__react-email-column" style="margin:0;padding:38px 18px 24px 18px">
                                    <img alt="vvault" height="auto" src="https://resend-attachments.s3.amazonaws.com/5f167b30-2e5c-4ad1-ae04-2fe01164febe" style="display:block;outline:none;border:0;text-decoration:none;max-width:100%;width:92px;height:auto" width="92" />
                                  </td>
                                </tr>
                                <tr style="margin:0;padding:0">
                                  <td data-id="__react-email-column" style="margin:0;padding:0 18px">
                                    <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="margin-top:0;margin-right:0;margin-bottom:0;margin-left:0;padding-top:0;padding-right:0;padding-bottom:0;padding-left:0;width:100%;background:#f1f1f5;border-radius:18px;border-collapse:separate">
                                      <tbody>
                                        <tr style="margin:0;padding:0">
                                          <td data-id="__react-email-column" style="margin:0;padding:32px 28px 28px 28px">
                                            <h1 style="margin:0 0 24px 0;padding:0;font-size:26px;line-height:1.25;color:#0a0a0a;font-family:Arial,Helvetica,sans-serif;font-weight:700">What your dashboard looks like once you start sending</h1>
                                            <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                                              <tbody style="width:100%">
                                                <tr style="width:100%">
                                                  <td align="left" data-id="__react-email-column">
                                                    <a href="https://vvault.app" style="color:#067df7;text-decoration-line:none" target="_blank"><img alt="A dark-themed dashboard displays lifetime statistics including emails sent, plays, downloads, opens, clicks, saves, and purchases." height="327" src="https://resend-attachments.s3.amazonaws.com/273856cb-f264-40f5-a76a-33034596f9fe" style="display:block;outline:none;border:none;text-decoration:none;max-width:100%;border-radius:16px" width="508" /></a>
                                                  </td>
                                                </tr>
                                              </tbody>
                                            </table>
                                            <p style="margin:0 0 20px 0;padding:0;font-size:15px;line-height:1.5;color:#242424;font-family:Arial,Helvetica,sans-serif"><br />Hey {{firstName}},</p>
                                            <p style="margin:0 0 20px 0;padding:0;font-size:15px;line-height:1.5;color:#242424;font-family:Arial,Helvetica,sans-serif"><strong>988</strong> emails sent. <strong>43</strong> opens, <strong>46</strong> clicks, <strong>1,630</strong> plays, <strong>83</strong> downloads. Real activity from a producer using vvault. He knows exactly who&#x27;s listening, who downloaded, and who&#x27;s worth following up with.</p>
                                            <p style="margin:0 0 20px 0;padding:0;font-size:15px;line-height:1.5;color:#242424;font-family:Arial,Helvetica,sans-serif">You could get the same thing <strong>the second</strong> your first pack goes out. Drag and drop or drop a zip and vvault auto-creates the pack.</p>
                                            <p style="margin:0 0 20px 0;padding:0;font-size:15px;line-height:1.5;color:#242424;font-family:Arial,Helvetica,sans-serif">Edward, from vvault</p>
                                            <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="margin-top:8px;margin-right:0;margin-bottom:0;margin-left:0;padding-top:0;padding-right:0;padding-bottom:0;padding-left:0;border-collapse:collapse">
                                              <tbody>
                                                <tr style="margin:0;padding:0">
                                                  <td align="left" data-id="__react-email-column" style="margin:0;padding:0">
                                                    <p style="margin:0;padding:0"><a href="https://vvault.app/library" rel="noopener noreferrer nofollow" style="color:#ffffff;text-decoration-line:none;text-decoration:none;display:inline-block;padding:12px 24px;background:#000000;border-radius:10px;font-weight:700;font-size:15px;line-height:1;font-family:Arial,Helvetica,sans-serif" target="_blank">Drop your first pack</a></p>
                                                  </td>
                                                </tr>
                                              </tbody>
                                            </table>
                                          </td>
                                        </tr>
                                      </tbody>
                                    </table>
                                  </td>
                                </tr>
                                <tr style="margin:0;padding:0">
                                  <td align="center" data-id="__react-email-column" style="margin:0;padding:32px 18px 0 18px">
                                    <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                                      <tbody style="width:100%">
                                        <tr style="width:100%">
                                          <td align="center" data-id="__react-email-column">
                                            <a href="https://apps.apple.com/us/app/vvault/id6759256796" style="color:#067df7;text-decoration-line:none" target="_blank"><img alt="Download on the App Store" height="44" src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Download_on_the_App_Store_Badge.svg/3840px-Download_on_the_App_Store_Badge.svg.png" style="display:block;outline:none;border:0;text-decoration:none;max-width:100%;height:44px;width:auto" width="148" /></a>
                                          </td>
                                        </tr>
                                      </tbody>
                                    </table>
                                  </td>
                                </tr>
                                <tr style="margin:0;padding:0">
                                  <td align="center" data-id="__react-email-column" style="margin:0;padding:28px 32px 0 32px;color:#6f6f78;font-size:12px;line-height:1.4;font-family:Arial,Helvetica,sans-serif;text-align:center">
                                    <p style="margin:0 0 18px 0;padding:0">You received this email because you signed up for vvault. You can unsubscribe at any time.</p>
                                    <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="margin-top:0;margin-right:auto;margin-bottom:26px;margin-left:auto;padding-top:0;padding-right:0;padding-bottom:0;padding-left:0;border-collapse:collapse">
                                      <tbody>
                                        <tr style="margin:0;padding:0">
                                          <td data-id="__react-email-column" style="margin:0;padding:0 12px"><a href="https://discord.gg/HNBur5zKp" style="color:#067df7;text-decoration-line:none" target="_blank"><img alt="Discord" height="32" src="https://cdn.simpleicons.org/discord/5865F2" style="display:block;outline:none;border:0;text-decoration:none;max-width:100%;width:32px;height:32px;opacity:0.8" width="32" /></a></td>
                                          <td data-id="__react-email-column" style="margin:0;padding:0 12px"><a href="https://instagram.com/vvault.app" style="color:#067df7;text-decoration-line:none" target="_blank"><img alt="Instagram" height="32" src="https://cdn.simpleicons.org/instagram/E4405F" style="display:block;outline:none;border:0;text-decoration:none;max-width:100%;width:32px;height:32px;opacity:0.8" width="32" /></a></td>
                                          <td data-id="__react-email-column" style="margin:0;padding:0 12px"><a href="https://youtube.com/@vvaultapp" style="color:#067df7;text-decoration-line:none" target="_blank"><img alt="YouTube" height="32" src="https://cdn.simpleicons.org/youtube/FF0000" style="display:block;outline:none;border:0;text-decoration:none;max-width:100%;width:32px;height:32px;opacity:0.8" width="32" /></a></td>
                                          <td data-id="__react-email-column" style="margin:0;padding:0 12px"><a href="https://www.tiktok.com/@vvault.app" style="color:#067df7;text-decoration-line:none" target="_blank"><img alt="TikTok" height="32" src="https://cdn.simpleicons.org/tiktok/000000" style="display:block;outline:none;border:0;text-decoration:none;max-width:100%;width:32px;height:32px;opacity:0.8" width="32" /></a></td>
                                        </tr>
                                      </tbody>
                                    </table>
                                    <p style="margin:0 0 14px 0;padding:0"><a href="https://vvault.app/privacy" rel="noopener noreferrer nofollow" style="color:#6f6f78;text-decoration-line:none;text-decoration:none" target="_blank">Privacy</a><span><span style="padding:0 6px">|</span></span><a href="https://vvault.app/terms" rel="noopener noreferrer nofollow" style="color:#6f6f78;text-decoration-line:none;text-decoration:none" target="_blank">Terms</a><span><span style="padding:0 6px">|</span></span><a href="mailto:edward@vvault.app" rel="noopener noreferrer nofollow" style="color:#6f6f78;text-decoration-line:none;text-decoration:none" target="_blank">Contact</a></p>
                                    <p style="margin:0 0 24px 0;padding:0"><a href="{{unsubscribeUrl}}" rel="noopener noreferrer nofollow" style="color:#6f6f78;text-decoration-line:none;text-decoration:none" target="_blank">Unsubscribe</a></p>
                                    <div style="margin:0;padding:0;height:96px;overflow:hidden;text-align:center">
                                      <img alt="vvault" height="auto" src="https://resend-attachments.s3.amazonaws.com/f7974fdb-3aa9-49d7-9745-2b1857a5a940" style="display:inline-block;outline:none;border:0;text-decoration:none;max-width:100%;width:560px;height:auto;margin-top:30px;opacity:0.08" width="560" />
                                    </div>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                    <p style="margin:0;padding:0"><br /></p>
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
    <!--/$-->
  </body>
</html>`;

const html_3 = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html dir="ltr" lang="en">
  <head>
    <meta content="width=device-width" name="viewport" />
    <link rel="preload" as="image" href="https://resend-attachments.s3.amazonaws.com/5f167b30-2e5c-4ad1-ae04-2fe01164febe" />
    <link rel="preload" as="image" href="https://resend-attachments.s3.amazonaws.com/90edba69-62c2-4a9d-b269-f9b296e83dff" />
    <link rel="preload" as="image" href="https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Download_on_the_App_Store_Badge.svg/3840px-Download_on_the_App_Store_Badge.svg.png" />
    <link rel="preload" as="image" href="https://cdn.simpleicons.org/discord/5865F2" />
    <link rel="preload" as="image" href="https://cdn.simpleicons.org/instagram/E4405F" />
    <link rel="preload" as="image" href="https://cdn.simpleicons.org/youtube/FF0000" />
    <link rel="preload" as="image" href="https://cdn.simpleicons.org/tiktok/000000" />
    <link rel="preload" as="image" href="https://resend-attachments.s3.amazonaws.com/f7974fdb-3aa9-49d7-9745-2b1857a5a940" />
    <meta content="text/html; charset=UTF-8" http-equiv="Content-Type" />
    <meta name="x-apple-disable-message-reformatting" />
    <meta content="IE=edge" http-equiv="X-UA-Compatible" />
    <meta name="x-apple-disable-message-reformatting" />
    <meta content="telephone=no,address=no,email=no,date=no,url=no" name="format-detection" />
  </head>
  <body style="background-color:#ffffff">
    <!--$--><!--html--><!--head--><!--body-->
    <table border="0" width="100%" cellpadding="0" cellspacing="0" role="presentation" align="center">
      <tbody>
        <tr>
          <td style="background-color:#ffffff">
            <table align="left" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="max-width:600px;align:left;width:100%;color:#000000;background-color:#ffffff;padding-top:0px;padding-right:0px;padding-bottom:0px;padding-left:0px;border-radius:0px;border-color:#000000">
              <tbody>
                <tr style="width:100%">
                  <td>
                    <div style="margin:0;padding:0;display:none;overflow:hidden;line-height:1px;opacity:0;max-height:0;max-width:0">
                      <p style="margin:0;padding:0">Your preview text goes here.</p>
                    </div>
                    <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="margin-top:0;margin-right:auto;margin-bottom:0;margin-left:auto;padding-top:0;padding-right:0;padding-bottom:0;padding-left:0;background-color:#f8f8fa">
                      <tbody>
                        <tr style="margin:0;padding:0">
                          <td align="center" data-id="__react-email-column" style="margin:0;padding:0;background-color:#f8f8fa">
                            <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="margin-top:0;margin-right:auto;margin-bottom:0;margin-left:auto;padding-top:0;padding-right:0;padding-bottom:0;padding-left:0;max-width:600px;width:100%;background-color:#f8f8fa">
                              <tbody>
                                <tr style="margin:0;padding:0">
                                  <td align="left" data-id="__react-email-column" style="margin:0;padding:38px 18px 24px 18px">
                                    <img alt="vvault" height="auto" src="https://resend-attachments.s3.amazonaws.com/5f167b30-2e5c-4ad1-ae04-2fe01164febe" style="display:block;outline:none;border:0;text-decoration:none;max-width:100%;width:92px;height:auto" width="92" />
                                  </td>
                                </tr>
                                <tr style="margin:0;padding:0">
                                  <td data-id="__react-email-column" style="margin:0;padding:0 18px">
                                    <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="margin-top:0;margin-right:0;margin-bottom:0;margin-left:0;padding-top:0;padding-right:0;padding-bottom:0;padding-left:0;width:100%;background:#f1f1f5;border-radius:18px;border-collapse:separate">
                                      <tbody>
                                        <tr style="margin:0;padding:0">
                                          <td data-id="__react-email-column" style="margin:0;padding:32px 28px 28px 28px">
                                            <h1 style="margin:0 0 24px 0;padding:0;font-size:26px;line-height:1.25;color:#0a0a0a;font-family:Arial,Helvetica,sans-serif;font-weight:700">Your catalog can wait</h1>
                                            <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                                              <tbody style="width:100%">
                                                <tr style="width:100%">
                                                  <td align="left" data-id="__react-email-column">
                                                    <a href="https://vvault.app" style="color:#067df7;text-decoration-line:none" target="_blank"><img alt="A dark UI displays four music pack covers featuring abstract patterns, a flower, and snakes." height="auto" src="https://resend-attachments.s3.amazonaws.com/90edba69-62c2-4a9d-b269-f9b296e83dff" style="display:block;outline:none;border:none;text-decoration:none;max-width:100%;border-radius:16px" width="520" /></a>
                                                  </td>
                                                </tr>
                                              </tbody>
                                            </table>
                                            <p style="margin:0 0 20px 0;padding:0;font-size:15px;line-height:1.5;color:#242424;font-family:Arial,Helvetica,sans-serif"><br />Hey {{firstName}},</p>
                                            <p style="margin:0 0 20px 0;padding:0;font-size:15px;line-height:1.5;color:#242424;font-family:Arial,Helvetica,sans-serif">One thing that stops people from getting started here. They&#x27;ve got 80 or 200 beats sitting in Google Drive and the idea of moving all of it <strong>feels like a project they don&#x27;t want to start tonight.</strong></p>
                                            <p style="margin:0;padding:0;margin-top:0;margin-right:0;margin-bottom:20px;margin-left:0;padding-top:0;padding-right:0;padding-bottom:0;padding-left:0;font-size:15px;line-height:1.5;color:#242424;font-family:Arial,Helvetica,sans-serif">Don&#x27;t move everything. Pick 5 tracks. The 5 you&#x27;d send to someone right now if a manager texted asking for fresh material. <strong>Drop those in.</strong> The rest of your catalog stays exactly where it is until you want to move it.</p>
                                            <p style="margin:0 0 20px 0;padding:0;font-size:15px;line-height:1.5;color:#242424;font-family:Arial,Helvetica,sans-serif">That&#x27;s enough to use vvault for real and see how it feels.<br /><br />Edward, from vvault</p>
                                            <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="margin-top:8px;margin-right:0;margin-bottom:0;margin-left:0;padding-top:0;padding-right:0;padding-bottom:0;padding-left:0;border-collapse:collapse">
                                              <tbody>
                                                <tr style="margin:0;padding:0">
                                                  <td align="left" data-id="__react-email-column" style="margin:0;padding:0">
                                                    <p style="margin:0;padding:0"><a href="https://vvault.app/library" rel="noopener noreferrer nofollow" style="color:#ffffff;text-decoration-line:none;text-decoration:none;display:inline-block;padding:12px 24px;background:#000000;border-radius:10px;font-weight:700;font-size:15px;line-height:1;font-family:Arial,Helvetica,sans-serif" target="_blank">Drop 5 tracks</a></p>
                                                  </td>
                                                </tr>
                                              </tbody>
                                            </table>
                                          </td>
                                        </tr>
                                      </tbody>
                                    </table>
                                  </td>
                                </tr>
                                <tr style="margin:0;padding:0">
                                  <td align="center" data-id="__react-email-column" style="margin:0;padding:32px 18px 0 18px">
                                    <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                                      <tbody style="width:100%">
                                        <tr style="width:100%">
                                          <td align="center" data-id="__react-email-column">
                                            <a href="https://apps.apple.com/us/app/vvault/id6759256796" style="color:#067df7;text-decoration-line:none" target="_blank"><img alt="Download on the App Store" height="44" src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Download_on_the_App_Store_Badge.svg/3840px-Download_on_the_App_Store_Badge.svg.png" style="display:block;outline:none;border:0;text-decoration:none;max-width:100%;height:44px;width:auto" width="148" /></a>
                                          </td>
                                        </tr>
                                      </tbody>
                                    </table>
                                  </td>
                                </tr>
                                <tr style="margin:0;padding:0">
                                  <td align="center" data-id="__react-email-column" style="margin:0;padding:28px 32px 0 32px;color:#6f6f78;font-size:12px;line-height:1.4;font-family:Arial,Helvetica,sans-serif;text-align:center">
                                    <p style="margin:0 0 18px 0;padding:0">You received this email because you signed up for vvault. You can unsubscribe at any time.</p>
                                    <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="margin-top:0;margin-right:auto;margin-bottom:26px;margin-left:auto;padding-top:0;padding-right:0;padding-bottom:0;padding-left:0;border-collapse:collapse">
                                      <tbody>
                                        <tr style="margin:0;padding:0">
                                          <td data-id="__react-email-column" style="margin:0;padding:0 12px"><a href="https://discord.gg/HNBur5zKp" style="color:#067df7;text-decoration-line:none" target="_blank"><img alt="Discord" height="32" src="https://cdn.simpleicons.org/discord/5865F2" style="display:block;outline:none;border:0;text-decoration:none;max-width:100%;width:32px;height:32px;opacity:0.8" width="32" /></a></td>
                                          <td data-id="__react-email-column" style="margin:0;padding:0 12px"><a href="https://instagram.com/vvault.app" style="color:#067df7;text-decoration-line:none" target="_blank"><img alt="Instagram" height="32" src="https://cdn.simpleicons.org/instagram/E4405F" style="display:block;outline:none;border:0;text-decoration:none;max-width:100%;width:32px;height:32px;opacity:0.8" width="32" /></a></td>
                                          <td data-id="__react-email-column" style="margin:0;padding:0 12px"><a href="https://youtube.com/@vvaultapp" style="color:#067df7;text-decoration-line:none" target="_blank"><img alt="YouTube" height="32" src="https://cdn.simpleicons.org/youtube/FF0000" style="display:block;outline:none;border:0;text-decoration:none;max-width:100%;width:32px;height:32px;opacity:0.8" width="32" /></a></td>
                                          <td data-id="__react-email-column" style="margin:0;padding:0 12px"><a href="https://www.tiktok.com/@vvault.app" style="color:#067df7;text-decoration-line:none" target="_blank"><img alt="TikTok" height="32" src="https://cdn.simpleicons.org/tiktok/000000" style="display:block;outline:none;border:0;text-decoration:none;max-width:100%;width:32px;height:32px;opacity:0.8" width="32" /></a></td>
                                        </tr>
                                      </tbody>
                                    </table>
                                    <p style="margin:0 0 14px 0;padding:0"><a href="https://vvault.app/privacy" rel="noopener noreferrer nofollow" style="color:#6f6f78;text-decoration-line:none;text-decoration:none" target="_blank">Privacy</a><span><span style="padding:0 6px">|</span></span><a href="https://vvault.app/terms" rel="noopener noreferrer nofollow" style="color:#6f6f78;text-decoration-line:none;text-decoration:none" target="_blank">Terms</a><span><span style="padding:0 6px">|</span></span><a href="mailto:edward@vvault.app" rel="noopener noreferrer nofollow" style="color:#6f6f78;text-decoration-line:none;text-decoration:none" target="_blank">Contact</a></p>
                                    <p style="margin:0 0 24px 0;padding:0"><a href="{{unsubscribeUrl}}" rel="noopener noreferrer nofollow" style="color:#6f6f78;text-decoration-line:none;text-decoration:none" target="_blank">Unsubscribe</a></p>
                                    <div style="margin:0;padding:0;height:96px;overflow:hidden;text-align:center">
                                      <img alt="vvault" height="auto" src="https://resend-attachments.s3.amazonaws.com/f7974fdb-3aa9-49d7-9745-2b1857a5a940" style="display:inline-block;outline:none;border:0;text-decoration:none;max-width:100%;width:560px;height:auto;margin-top:30px;opacity:0.08" width="560" />
                                    </div>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                    <p style="margin:0;padding:0"><br /></p>
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
    <!--/$-->
  </body>
</html>`;

const html_4 = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html dir="ltr" lang="en">
  <head>
    <meta content="width=device-width" name="viewport" />
    <link rel="preload" as="image" href="https://resend-attachments.s3.amazonaws.com/5f167b30-2e5c-4ad1-ae04-2fe01164febe" />
    <link rel="preload" as="image" href="https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Download_on_the_App_Store_Badge.svg/3840px-Download_on_the_App_Store_Badge.svg.png" />
    <link rel="preload" as="image" href="https://cdn.simpleicons.org/discord/5865F2" />
    <link rel="preload" as="image" href="https://cdn.simpleicons.org/instagram/E4405F" />
    <link rel="preload" as="image" href="https://cdn.simpleicons.org/youtube/FF0000" />
    <link rel="preload" as="image" href="https://cdn.simpleicons.org/tiktok/000000" />
    <link rel="preload" as="image" href="https://resend-attachments.s3.amazonaws.com/f7974fdb-3aa9-49d7-9745-2b1857a5a940" />
    <meta content="text/html; charset=UTF-8" http-equiv="Content-Type" />
    <meta name="x-apple-disable-message-reformatting" />
    <meta content="IE=edge" http-equiv="X-UA-Compatible" />
    <meta name="x-apple-disable-message-reformatting" />
    <meta content="telephone=no,address=no,email=no,date=no,url=no" name="format-detection" />
  </head>
  <body style="background-color:#ffffff">
    <!--$--><!--html--><!--head--><!--body-->
    <table border="0" width="100%" cellpadding="0" cellspacing="0" role="presentation" align="center">
      <tbody>
        <tr>
          <td style="background-color:#ffffff">
            <table align="left" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="max-width:600px;align:left;width:100%;color:#000000;background-color:#ffffff;padding-top:0px;padding-right:0px;padding-bottom:0px;padding-left:0px;border-radius:0px;border-color:#000000">
              <tbody>
                <tr style="width:100%">
                  <td>
                    <div style="margin:0;padding:0;display:none;overflow:hidden;line-height:1px;opacity:0;max-height:0;max-width:0">
                      <p style="margin:0;padding:0">Your preview text goes here.</p>
                    </div>
                    <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="margin-top:0;margin-right:auto;margin-bottom:0;margin-left:auto;padding-top:0;padding-right:0;padding-bottom:0;padding-left:0;background-color:#f8f8fa">
                      <tbody>
                        <tr style="margin:0;padding:0">
                          <td align="center" data-id="__react-email-column" style="margin:0;padding:0;background-color:#f8f8fa">
                            <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="margin-top:0;margin-right:auto;margin-bottom:0;margin-left:auto;padding-top:0;padding-right:0;padding-bottom:0;padding-left:0;max-width:600px;width:100%;background-color:#f8f8fa">
                              <tbody>
                                <tr style="margin:0;padding:0">
                                  <td align="left" data-id="__react-email-column" style="margin:0;padding:38px 18px 24px 18px">
                                    <img alt="vvault" height="auto" src="https://resend-attachments.s3.amazonaws.com/5f167b30-2e5c-4ad1-ae04-2fe01164febe" style="display:block;outline:none;border:0;text-decoration:none;max-width:100%;width:92px;height:auto" width="92" />
                                  </td>
                                </tr>
                                <tr style="margin:0;padding:0">
                                  <td data-id="__react-email-column" style="margin:0;padding:0 18px">
                                    <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="margin-top:0;margin-right:0;margin-bottom:0;margin-left:0;padding-top:0;padding-right:0;padding-bottom:0;padding-left:0;width:100%;background:#f1f1f5;border-radius:18px;border-collapse:separate">
                                      <tbody>
                                        <tr style="margin:0;padding:0">
                                          <td data-id="__react-email-column" style="margin:0;padding:32px 28px 28px 28px">
                                            <h1 style="margin:0 0 24px 0;padding:0;font-size:26px;line-height:1.25;color:#0a0a0a;font-family:Arial,Helvetica,sans-serif;font-weight:700">We miss you at vvault.</h1>
                                            <p style="margin:0;padding:0">Hey {{firstName}},</p>
                                            <p style="margin:0;padding:0"><br /></p>
                                            <p style="margin:0;padding:0">Saw your account is still empty. Just curious what got in the way 😊. Was the upload flow confusing? Did the pricing feel off? Did you just get busy and forget about it?</p>
                                            <p style="margin:0;padding:0"><br /></p>
                                            <p style="margin:0 0 20px 0;padding:0;font-size:15px;line-height:1.5;color:#242424;font-family:Arial,Helvetica,sans-serif">Whatever it is, <strong>hit reply and tell me.</strong> If it&#x27;s faster, contact us on instagram @[vvault.app](http://vvault.app) and I&#x27;ll reply in minutes.</p>
                                            <p style="margin:0 0 20px 0;padding:0;font-size:15px;line-height:1.5;color:#242424;font-family:Arial,Helvetica,sans-serif">Edward, from vvault</p>
                                            <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="margin-top:8px;margin-right:0;margin-bottom:0;margin-left:0;padding-top:0;padding-right:0;padding-bottom:0;padding-left:0;border-collapse:collapse">
                                              <tbody>
                                                <tr style="margin:0;padding:0">
                                                  <td align="left" data-id="__react-email-column" style="margin:0;padding:0">
                                                    <p style="margin:0;padding:0"><a href="https://youtu.be/m2WPJvKnCzU" rel="noopener noreferrer nofollow" style="color:#ffffff;text-decoration-line:none;text-decoration:none;display:inline-block;padding:12px 24px;background:#000000;border-radius:10px;font-weight:700;font-size:15px;line-height:1;font-family:Arial,Helvetica,sans-serif" target="_blank">Watch the vvault tutorial</a></p>
                                                  </td>
                                                </tr>
                                              </tbody>
                                            </table>
                                          </td>
                                        </tr>
                                      </tbody>
                                    </table>
                                  </td>
                                </tr>
                                <tr style="margin:0;padding:0">
                                  <td align="center" data-id="__react-email-column" style="margin:0;padding:32px 18px 0 18px">
                                    <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                                      <tbody style="width:100%">
                                        <tr style="width:100%">
                                          <td align="center" data-id="__react-email-column">
                                            <a href="https://apps.apple.com/us/app/vvault/id6759256796" style="color:#067df7;text-decoration-line:none" target="_blank"><img alt="Download on the App Store" height="44" src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Download_on_the_App_Store_Badge.svg/3840px-Download_on_the_App_Store_Badge.svg.png" style="display:block;outline:none;border:0;text-decoration:none;max-width:100%;height:44px;width:auto" width="148" /></a>
                                          </td>
                                        </tr>
                                      </tbody>
                                    </table>
                                  </td>
                                </tr>
                                <tr style="margin:0;padding:0">
                                  <td align="center" data-id="__react-email-column" style="margin:0;padding:28px 32px 0 32px;color:#6f6f78;font-size:12px;line-height:1.4;font-family:Arial,Helvetica,sans-serif;text-align:center">
                                    <p style="margin:0 0 18px 0;padding:0">You received this email because you signed up for vvault. You can unsubscribe at any time.</p>
                                    <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="margin-top:0;margin-right:auto;margin-bottom:26px;margin-left:auto;padding-top:0;padding-right:0;padding-bottom:0;padding-left:0;border-collapse:collapse">
                                      <tbody>
                                        <tr style="margin:0;padding:0">
                                          <td data-id="__react-email-column" style="margin:0;padding:0 12px"><a href="https://discord.gg/HNBur5zKp" style="color:#067df7;text-decoration-line:none" target="_blank"><img alt="Discord" height="32" src="https://cdn.simpleicons.org/discord/5865F2" style="display:block;outline:none;border:0;text-decoration:none;max-width:100%;width:32px;height:32px;opacity:0.8" width="32" /></a></td>
                                          <td data-id="__react-email-column" style="margin:0;padding:0 12px"><a href="https://instagram.com/vvault.app" style="color:#067df7;text-decoration-line:none" target="_blank"><img alt="Instagram" height="32" src="https://cdn.simpleicons.org/instagram/E4405F" style="display:block;outline:none;border:0;text-decoration:none;max-width:100%;width:32px;height:32px;opacity:0.8" width="32" /></a></td>
                                          <td data-id="__react-email-column" style="margin:0;padding:0 12px"><a href="https://youtube.com/@vvaultapp" style="color:#067df7;text-decoration-line:none" target="_blank"><img alt="YouTube" height="32" src="https://cdn.simpleicons.org/youtube/FF0000" style="display:block;outline:none;border:0;text-decoration:none;max-width:100%;width:32px;height:32px;opacity:0.8" width="32" /></a></td>
                                          <td data-id="__react-email-column" style="margin:0;padding:0 12px"><a href="https://www.tiktok.com/@vvault.app" style="color:#067df7;text-decoration-line:none" target="_blank"><img alt="TikTok" height="32" src="https://cdn.simpleicons.org/tiktok/000000" style="display:block;outline:none;border:0;text-decoration:none;max-width:100%;width:32px;height:32px;opacity:0.8" width="32" /></a></td>
                                        </tr>
                                      </tbody>
                                    </table>
                                    <p style="margin:0 0 14px 0;padding:0"><a href="https://vvault.app/privacy" rel="noopener noreferrer nofollow" style="color:#6f6f78;text-decoration-line:none;text-decoration:none" target="_blank">Privacy</a><span><span style="padding:0 6px">|</span></span><a href="https://vvault.app/terms" rel="noopener noreferrer nofollow" style="color:#6f6f78;text-decoration-line:none;text-decoration:none" target="_blank">Terms</a><span><span style="padding:0 6px">|</span></span><a href="mailto:edward@vvault.app" rel="noopener noreferrer nofollow" style="color:#6f6f78;text-decoration-line:none;text-decoration:none" target="_blank">Contact</a></p>
                                    <p style="margin:0 0 24px 0;padding:0"><a href="{{unsubscribeUrl}}" rel="noopener noreferrer nofollow" style="color:#6f6f78;text-decoration-line:none;text-decoration:none" target="_blank">Unsubscribe</a></p>
                                    <div style="margin:0;padding:0;height:96px;overflow:hidden;text-align:center">
                                      <img alt="vvault" height="auto" src="https://resend-attachments.s3.amazonaws.com/f7974fdb-3aa9-49d7-9745-2b1857a5a940" style="display:inline-block;outline:none;border:0;text-decoration:none;max-width:100%;width:560px;height:auto;margin-top:30px;opacity:0.08" width="560" />
                                    </div>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                    <p style="margin:0;padding:0"><br /></p>
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
    <!--/$-->
  </body>
</html>`;

const html_5 = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html dir="ltr" lang="en">
  <head>
    <meta content="width=device-width" name="viewport" />
    <link rel="preload" as="image" href="https://resend-attachments.s3.amazonaws.com/5f167b30-2e5c-4ad1-ae04-2fe01164febe" />
    <link rel="preload" as="image" href="https://resend-attachments.s3.amazonaws.com/a132ec64-9098-441a-9592-90774da8ed36" />
    <link rel="preload" as="image" href="https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Download_on_the_App_Store_Badge.svg/3840px-Download_on_the_App_Store_Badge.svg.png" />
    <link rel="preload" as="image" href="https://cdn.simpleicons.org/discord/5865F2" />
    <link rel="preload" as="image" href="https://cdn.simpleicons.org/instagram/E4405F" />
    <link rel="preload" as="image" href="https://cdn.simpleicons.org/youtube/FF0000" />
    <link rel="preload" as="image" href="https://cdn.simpleicons.org/tiktok/000000" />
    <link rel="preload" as="image" href="https://resend-attachments.s3.amazonaws.com/f7974fdb-3aa9-49d7-9745-2b1857a5a940" />
    <meta content="text/html; charset=UTF-8" http-equiv="Content-Type" />
    <meta name="x-apple-disable-message-reformatting" />
    <meta content="IE=edge" http-equiv="X-UA-Compatible" />
    <meta name="x-apple-disable-message-reformatting" />
    <meta content="telephone=no,address=no,email=no,date=no,url=no" name="format-detection" />
  </head>
  <body style="background-color:#ffffff">
    <!--$--><!--html--><!--head--><!--body-->
    <table border="0" width="100%" cellpadding="0" cellspacing="0" role="presentation" align="center">
      <tbody>
        <tr>
          <td style="background-color:#ffffff">
            <table align="left" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="max-width:600px;align:left;width:100%;color:#000000;background-color:#ffffff;padding-top:0px;padding-right:0px;padding-bottom:0px;padding-left:0px;border-radius:0px;border-color:#000000">
              <tbody>
                <tr style="width:100%">
                  <td>
                    <div style="margin:0;padding:0;display:none;overflow:hidden;line-height:1px;opacity:0;max-height:0;max-width:0">
                      <p style="margin:0;padding:0">Your preview text goes here.</p>
                    </div>
                    <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="margin-top:0;margin-right:auto;margin-bottom:0;margin-left:auto;padding-top:0;padding-right:0;padding-bottom:0;padding-left:0;background-color:#f8f8fa">
                      <tbody>
                        <tr style="margin:0;padding:0">
                          <td align="center" data-id="__react-email-column" style="margin:0;padding:0;background-color:#f8f8fa">
                            <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="margin-top:0;margin-right:auto;margin-bottom:0;margin-left:auto;padding-top:0;padding-right:0;padding-bottom:0;padding-left:0;max-width:600px;width:100%;background-color:#f8f8fa">
                              <tbody>
                                <tr style="margin:0;padding:0">
                                  <td align="left" data-id="__react-email-column" style="margin:0;padding:38px 18px 24px 18px">
                                    <img alt="vvault" height="auto" src="https://resend-attachments.s3.amazonaws.com/5f167b30-2e5c-4ad1-ae04-2fe01164febe" style="display:block;outline:none;border:0;text-decoration:none;max-width:100%;width:92px;height:auto" width="92" />
                                  </td>
                                </tr>
                                <tr style="margin:0;padding:0">
                                  <td data-id="__react-email-column" style="margin:0;padding:0 18px">
                                    <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="margin-top:0;margin-right:0;margin-bottom:0;margin-left:0;padding-top:0;padding-right:0;padding-bottom:0;padding-left:0;width:100%;background:#f1f1f5;border-radius:18px;border-collapse:separate">
                                      <tbody>
                                        <tr style="margin:0;padding:0">
                                          <td data-id="__react-email-column" style="margin:0;padding:32px 28px 28px 28px">
                                            <h1 style="margin:0 0 24px 0;padding:0;font-size:26px;line-height:1.25;color:#0a0a0a;font-family:Arial,Helvetica,sans-serif;font-weight:700">Save 88.88% on your first month</h1>
                                            <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                                              <tbody style="width:100%">
                                                <tr style="width:100%">
                                                  <td align="left" data-id="__react-email-column">
                                                    <a href="https://vvault.app" style="color:#067df7;text-decoration-line:none" target="_blank"><img alt='A laptop sits on a stack of brown folders, with a large "1€" graphic in the background.' height="auto" src="https://resend-attachments.s3.amazonaws.com/a132ec64-9098-441a-9592-90774da8ed36" style="display:block;outline:none;border:none;text-decoration:none;max-width:100%;border-radius:16px" width="520" /></a>
                                                  </td>
                                                </tr>
                                              </tbody>
                                            </table>
                                            <p style="margin:0 0 20px 0;padding:0;font-size:15px;line-height:1.5;color:#242424;font-family:Arial,Helvetica,sans-serif"><br />Hey {{firstName}},</p>
                                            <p style="margin:0 0 20px 0;padding:0;font-size:15px;line-height:1.5;color:#242424;font-family:Arial,Helvetica,sans-serif">You uploaded music and stopped at the paywall. Makes sense. Sending with tracking is on Pro, and we get it, committing €8.99 a month to a tool you&#x27;ve used for 5 minutes is a lot to ask.</p>
                                            <p style="margin:0 0 20px 0;padding:0;font-size:15px;line-height:1.5;color:#242424;font-family:Arial,Helvetica,sans-serif">So your first month is €1. Use code FIRST at checkout. Same Pro plan, same tracking, same campaigns. €1 to test it for 30 days, then €8.99 if you want to keep going. Cancel anytime.</p>
                                            <p style="margin:0;padding:0;font-size:15px"><strong>Be quick, code exprires in 7 days.</strong></p>
                                            <p style="margin:0;padding:0"><br /></p>
                                            <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="margin-top:8px;margin-right:0;margin-bottom:0;margin-left:0;padding-top:0;padding-right:0;padding-bottom:0;padding-left:0;border-collapse:collapse">
                                              <tbody>
                                                <tr style="margin:0;padding:0">
                                                  <td align="left" data-id="__react-email-column" style="margin:0;padding:0">
                                                    <p style="margin:0;padding:0"><a href="https://vvault.app" rel="noopener noreferrer nofollow" style="color:#ffffff;text-decoration-line:none;text-decoration:none;display:inline-block;padding:12px 24px;background:#000000;border-radius:10px;font-weight:700;font-size:15px;line-height:1;font-family:Arial,Helvetica,sans-serif" target="_blank">I want pro at €1</a></p>
                                                  </td>
                                                </tr>
                                              </tbody>
                                            </table>
                                          </td>
                                        </tr>
                                      </tbody>
                                    </table>
                                  </td>
                                </tr>
                                <tr style="margin:0;padding:0">
                                  <td align="center" data-id="__react-email-column" style="margin:0;padding:32px 18px 0 18px">
                                    <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                                      <tbody style="width:100%">
                                        <tr style="width:100%">
                                          <td align="center" data-id="__react-email-column">
                                            <a href="https://apps.apple.com/us/app/vvault/id6759256796" style="color:#067df7;text-decoration-line:none" target="_blank"><img alt="Download on the App Store" height="44" src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Download_on_the_App_Store_Badge.svg/3840px-Download_on_the_App_Store_Badge.svg.png" style="display:block;outline:none;border:0;text-decoration:none;max-width:100%;height:44px;width:auto" width="148" /></a>
                                          </td>
                                        </tr>
                                      </tbody>
                                    </table>
                                  </td>
                                </tr>
                                <tr style="margin:0;padding:0">
                                  <td align="center" data-id="__react-email-column" style="margin:0;padding:28px 32px 0 32px;color:#6f6f78;font-size:12px;line-height:1.4;font-family:Arial,Helvetica,sans-serif;text-align:center">
                                    <p style="margin:0 0 18px 0;padding:0">You received this email because you signed up for vvault. You can unsubscribe at any time.</p>
                                    <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="margin-top:0;margin-right:auto;margin-bottom:26px;margin-left:auto;padding-top:0;padding-right:0;padding-bottom:0;padding-left:0;border-collapse:collapse">
                                      <tbody>
                                        <tr style="margin:0;padding:0">
                                          <td data-id="__react-email-column" style="margin:0;padding:0 12px"><a href="https://discord.gg/HNBur5zKp" style="color:#067df7;text-decoration-line:none" target="_blank"><img alt="Discord" height="32" src="https://cdn.simpleicons.org/discord/5865F2" style="display:block;outline:none;border:0;text-decoration:none;max-width:100%;width:32px;height:32px;opacity:0.8" width="32" /></a></td>
                                          <td data-id="__react-email-column" style="margin:0;padding:0 12px"><a href="https://instagram.com/vvault.app" style="color:#067df7;text-decoration-line:none" target="_blank"><img alt="Instagram" height="32" src="https://cdn.simpleicons.org/instagram/E4405F" style="display:block;outline:none;border:0;text-decoration:none;max-width:100%;width:32px;height:32px;opacity:0.8" width="32" /></a></td>
                                          <td data-id="__react-email-column" style="margin:0;padding:0 12px"><a href="https://youtube.com/@vvaultapp" style="color:#067df7;text-decoration-line:none" target="_blank"><img alt="YouTube" height="32" src="https://cdn.simpleicons.org/youtube/FF0000" style="display:block;outline:none;border:0;text-decoration:none;max-width:100%;width:32px;height:32px;opacity:0.8" width="32" /></a></td>
                                          <td data-id="__react-email-column" style="margin:0;padding:0 12px"><a href="https://www.tiktok.com/@vvault.app" style="color:#067df7;text-decoration-line:none" target="_blank"><img alt="TikTok" height="32" src="https://cdn.simpleicons.org/tiktok/000000" style="display:block;outline:none;border:0;text-decoration:none;max-width:100%;width:32px;height:32px;opacity:0.8" width="32" /></a></td>
                                        </tr>
                                      </tbody>
                                    </table>
                                    <p style="margin:0 0 14px 0;padding:0"><a href="https://vvault.app/privacy" rel="noopener noreferrer nofollow" style="color:#6f6f78;text-decoration-line:none;text-decoration:none" target="_blank">Privacy</a><span><span style="padding:0 6px">|</span></span><a href="https://vvault.app/terms" rel="noopener noreferrer nofollow" style="color:#6f6f78;text-decoration-line:none;text-decoration:none" target="_blank">Terms</a><span><span style="padding:0 6px">|</span></span><a href="mailto:edward@vvault.app" rel="noopener noreferrer nofollow" style="color:#6f6f78;text-decoration-line:none;text-decoration:none" target="_blank">Contact</a></p>
                                    <p style="margin:0 0 24px 0;padding:0"><a href="{{unsubscribeUrl}}" rel="noopener noreferrer nofollow" style="color:#6f6f78;text-decoration-line:none;text-decoration:none" target="_blank">Unsubscribe</a></p>
                                    <div style="margin:0;padding:0;height:96px;overflow:hidden;text-align:center">
                                      <img alt="vvault" height="auto" src="https://resend-attachments.s3.amazonaws.com/f7974fdb-3aa9-49d7-9745-2b1857a5a940" style="display:inline-block;outline:none;border:0;text-decoration:none;max-width:100%;width:560px;height:auto;margin-top:30px;opacity:0.08" width="560" />
                                    </div>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                    <p style="margin:0;padding:0"><br /></p>
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
    <!--/$-->
  </body>
</html>`;

export const TEMPLATES: Record<TemplateKey, Template> = {
  activation_1: { subject: "Still empty", html: html_1 },
  activation_2: { subject: "What your dashboard looks like once you start sending", html: html_2 },
  activation_3: { subject: "Your catalog can wait", html: html_3 },
  activation_4: { subject: "We miss you at vvault", html: html_4 },
  activation_5: { subject: "Save 88.88% on your first month", html: html_5 },
};
