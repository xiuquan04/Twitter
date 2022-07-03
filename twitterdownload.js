// Twitter download images and videos with 1 click

if (globalThis.GM_registerMenuCommand /* undefined in Firefox with VM */ || typeof GM_registerMenuCommand === "function") {
    GM_registerMenuCommand("Show settings", showSettings);
}

// --- For debug --- //
const verbose = false;


const settings = loadSettings();

function loadSettings() {
  const defaultSettings = {
    hideTrends: true,
    hideSignUpSection: true,
    hideTopicsToFollow: false,
    hideTopicsToFollowInstantly: false,
    hideSignUpBottomBarAndMessages: true,
    doNotPlayVideosAutomatically: false,
    goFromMobileToMainSite: false,

    highlightVisitedLinks: true,
    expandSpoilers: true,

    directLinks: true,
    handleTitle: true,

    imagesHandler: true,
    videoHandler: true,
    addRequiredCSS: true,
    preventBlinking: true,
  };

  let savedSettings;
  try {
    savedSettings = JSON.parse(localStorage.getItem("ujs-click-n-save-settings")) || {};
  } catch (e) {
    console.error("[ujs]", e);
    localStorage.removeItem("ujs-click-n-save-settings");
    savedSettings = {};
  }
  savedSettings = Object.assign(defaultSettings, savedSettings);
  return savedSettings;
}
function showSettings() {
  closeSetting();
  if (window.scrollY > 0) {
      document.querySelector("html").classList.add("ujs-scroll-initial");
      document.body.classList.add("ujs-scrollbar-width-margin-right");
  }
  document.body.classList.add("ujs-no-scroll");
  

  const modalWrapperStyle = `
    width: 100%;
    height: 100%;
    position: fixed;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 99999;
    backdrop-filter: blur(4px);
    background-color: rgba(255, 255, 255, 0.5);
  `;
  const modalSettingsStyle = `
    background-color: white;
    min-width: 320px;
    min-height: 320px;
    border: 1px solid darkgray;
    padding: 8px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  `;
  const s = settings;
  document.body.insertAdjacentHTML("afterbegin", `
  <div class="ujs-modal-wrapper" style="${modalWrapperStyle}">
      <div class="ujs-modal-settings" style="${modalSettingsStyle}">
          <fieldset>
              <legend>Optional</legend>
              <label><input type="checkbox" ${s.hideTrends ? "checked" : ""} name="hideTrends">Hide <b>Trends</b> (in the right column)*<br/></label>
              <label><input type="checkbox" ${s.hideSignUpSection ? "checked" : ""} name="hideSignUpSection">Hide <b title='"New to Twitter?" (If yoy are not logged in)'>Sign Up</b> section (in the right column)*<br/></label>
              <label><input type="checkbox" ${s.hideSignUpBottomBarAndMessages ? "checked" : ""} name="hideSignUpBottomBarAndMessages">Hide <b>Sign Up Bar</b> and <b>Messages</b> (in the bottom)<br/></label>
              <label hidden><input type="checkbox" ${s.doNotPlayVideosAutomatically ? "checked" : ""} name="doNotPlayVideosAutomatically">Do <i>Not</i> Play Videos Automatically</b><br/></label>
              <label hidden><input type="checkbox" ${s.goFromMobileToMainSite ? "checked" : ""} name="goFromMobileToMainSite">Redirect from Mobile version (beta)<br/></label>
          </fieldset>
          <fieldset>
              <legend>Recommended</legend>
              <label><input type="checkbox" ${s.highlightVisitedLinks ? "checked" : ""} name="highlightVisitedLinks">Highlight Visited Links<br/></label>
              <label title="Note: since the recent update the most NSFW spoilers are impossible to expand without an account"><input type="checkbox" ${s.expandSpoilers ? "checked" : ""} name="expandSpoilers">Expand Spoilers (if possible)*<br/></label>
          </fieldset>
          <fieldset>
              <legend>Highly Recommended</legend>
              <label><input type="checkbox" ${s.directLinks ? "checked" : ""} name="directLinks">Direct Links</label><br/>
              <label><input type="checkbox" ${s.handleTitle ? "checked" : ""} name="handleTitle">Enchance Title*<br/></label>
          </fieldset>
          <fieldset>
              <legend>Main</legend>
              <label><input type="checkbox" ${s.imagesHandler ? "checked" : ""} name="imagesHandler">Image Download Button<br/></label>
              <label><input type="checkbox" ${s.videoHandler ? "checked" : ""} name="videoHandler">Video Download Button<br/></label>
              <label title="Prevent the tweet backgroubd blinking on the button click"><input type="checkbox" ${s.preventBlinking ? "checked" : ""} name="preventBlinking">Prevent blinking on click<br/></label>
              <label hidden><input type="checkbox" ${s.addRequiredCSS ? "checked" : ""} name="addRequiredCSS">Add Required CSS*<br/></label><!-- * Only for the image download button in /photo/1 mode -->
          </fieldset>
            <fieldset>
              <legend title="Outdated due to Twitter's updates, impossible to reimplement">Outdated</legend>
              <strike>              
              <label><input type="checkbox" ${s.hideTopicsToFollow ? "checked" : ""} name="hideTopicsToFollow">Hide <b>Topics To Follow</b> (in the right column)*<br/></label>              
              <label hidden><input type="checkbox" ${s.hideTopicsToFollowInstantly ? "checked" : ""} name="hideTopicsToFollowInstantly">Hide <b>Topics To Follow</b> Instantly*<br/></label>
              </strike>
          </fieldset>
          <hr>
          <div style="display: flex; justify-content: space-around;">
              <button class="ujs-save-setting-button"  style="padding: 5px">Save Settings</button>
              <button class="ujs-close-setting-button" style="padding: 5px">Close Settings</button>
          </div>
          <hr>
          <h4 style="margin: 0; padding-left: 8px; color: #444;">Notes:</h4>
          <ul style="margin: 2px; padding-left: 16px; color: #444;">
            <li>Click on <b>Save Settings</b> and reload the page to apply changes.</li>
            <li><b>*</b>-marked settings are language dependent. Currently, the follow languages are supported:<br/> "en", "ru", "es", "zh", "ja".</li>
            <li hidden>The extension downloads only from twitter.com, not from <b>mobile</b>.twitter.com</li>
          </ul>
      </div>
  </div>`);

  document.querySelector("body > .ujs-modal-wrapper .ujs-save-setting-button").addEventListener("click", saveSetting);
  document.querySelector("body > .ujs-modal-wrapper .ujs-close-setting-button").addEventListener("click", closeSetting);

  function saveSetting() {
    const entries = [...document.querySelectorAll("body > .ujs-modal-wrapper input[type=checkbox]")]
        .map(checkbox => [checkbox.name, checkbox.checked]);
    const settings = Object.fromEntries(entries);
    settings.hideTopicsToFollowInstantly = settings.hideTopicsToFollow;
    // console.log("[ujs]", settings);
    localStorage.setItem("ujs-click-n-save-settings", JSON.stringify(settings));
  }

  function closeSetting() {
    document.body.classList.remove("ujs-no-scroll");
    document.body.classList.remove("ujs-scrollbar-width-margin-right");
    document.querySelector("html").classList.remove("ujs-scroll-initial");
    document.querySelector("body > .ujs-modal-wrapper")?.remove();
  }
}



// ---------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------

// --- Features to execute --- //
const doNotPlayVideosAutomatically = false;

function execFeaturesOnce() {
    settings.goFromMobileToMainSite         && Features.goFromMobileToMainSite();
    settings.addRequiredCSS                 && Features.addRequiredCSS();
    settings.hideSignUpBottomBarAndMessages && Features.hideSignUpBottomBarAndMessages(doNotPlayVideosAutomatically);
    settings.hideTrends                     && Features.hideTrends();
    settings.highlightVisitedLinks          && Features.highlightVisitedLinks();
    settings.hideTopicsToFollowInstantly    && Features.hideTopicsToFollowInstantly();
}
function execFeaturesImmediately() {
    settings.expandSpoilers     && Features.expandSpoilers();
}
function execFeatures() {
    settings.imagesHandler      && Features.imagesHandler(settings.preventBlinking);
    settings.videoHandler       && Features.videoHandler(settings.preventBlinking);
    settings.expandSpoilers     && Features.expandSpoilers();
    settings.hideSignUpSection  && Features.hideSignUpSection();
    settings.hideTopicsToFollow && Features.hideTopicsToFollow();
    settings.directLinks        && Features.directLinks();
    settings.handleTitle        && Features.handleTitle();
}

// ---------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------

if (verbose) {
  console.log("[ujs][settings]", settings);
  // showSettings();
}

// --- [VM/GM + Firefox ~90+ + Enabled "Strict Tracking Protection"] fix --- //
const fetch = (globalThis.wrappedJSObject && typeof globalThis.wrappedJSObject.fetch === "function") ? function(resource, init = {}) {
    verbose && console.log("wrappedJSObject.fetch", resource, init);

    if (init.headers instanceof Headers) {
        // Since `Headers` are not allowed for structured cloning.
        init.headers = Object.fromEntries(init.headers.entries());
    }

    return globalThis.wrappedJSObject.fetch(cloneInto(resource, document), cloneInto(init, document));
} : globalThis.fetch;


// --- "Imports" --- //
const {
    sleep, fetchResource, download,
    addCSS,
    getCookie,
    throttle,
    xpath, xpathAll,
    getNearestElementByType, getParentWithSiblingDataset,
} = getUtils({verbose});
const LS = hoistLS({verbose});

const API = hoistAPI();
const Tweet = hoistTweet();
const Features = hoistFeatures();
const I18N = getLanguageConstants();


// --- That to use for the image history --- //
// "TWEET_ID" or "IMAGE_NAME"
const imagesHistoryBy = LS.getItem("ujs-images-history-by", "IMAGE_NAME");
// With "TWEET_ID" downloading of 1 image of 4 will mark all 4 images as "already downloaded"
// on the next time when the tweet will appear.
// "IMAGE_NAME" will count each image of a tweet, but it will take more data to store.


// ---------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------
// --- Script runner --- //

(function starter(feats) {
    const {once, onChangeImmediate, onChange} = feats;

    once();
    onChangeImmediate();
    const onChangeThrottled = throttle(onChange, 250);
    onChangeThrottled();

    const targetNode = document.querySelector("body");
    const observerOptions = {
        subtree: true,
        childList: true,
    };
    const observer = new MutationObserver(callback);
    observer.observe(targetNode, observerOptions);

    function callback(mutationList, observer) {
        verbose && console.log(mutationList);
        onChangeImmediate();
        onChangeThrottled();
    }
})({
    once: execFeaturesOnce,
    onChangeImmediate: execFeaturesImmediately,
    onChange: execFeatures
});

// ---------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------
// --- Twitter Specific code --- //


const downloadedImages = new LS("ujs-twitter-downloaded-images-names");
const downloadedImageTweetIds = new LS("ujs-twitter-downloaded-image-tweet-ids");
const downloadedVideoTweetIds = new LS("ujs-twitter-downloaded-video-tweet-ids");

// --- Twitter.Features --- //
function hoistFeatures() {
    class Features {
        static goFromMobileToMainSite() {
            if (location.href.startsWith("https://mobile.twitter.com/")) {
                location.href = location.href.replace("https://mobile.twitter.com/", "https://twitter.com/");
            }
            // TODO: add #redirected, remove by timer // to prevent a potential infinity loop
        }
        static _ImageHistory = class {
            static getImageNameFromUrl(url) {
                const _url = new URL(url);
                const {filename} = (_url.origin + _url.pathname).match(/(?<filename>[^\/]+$)/).groups;
                return filename.match(/^[^\.]+/)[0]; // remove extension
            }
            static isDownloaded({id, url}) {
                if (imagesHistoryBy === "TWEET_ID") {
                    return downloadedImageTweetIds.hasItem(id);
                } else if (imagesHistoryBy === "IMAGE_NAME") {
                    const name = Features._ImageHistory.getImageNameFromUrl(url);
                    return downloadedImages.hasItem(name);
                }
            }
            static async markDownloaded({id, url}) {
                if (imagesHistoryBy === "TWEET_ID") {
                    await downloadedImageTweetIds.pushItem(id);
                } else if (imagesHistoryBy === "IMAGE_NAME") {
                    const name = Features._ImageHistory.getImageNameFromUrl(url);
                    await downloadedImages.pushItem(name);
                }
            }
        }
        static async imagesHandler(preventBlinking) {
            verbose && console.log("[ujs-cns][imagesHandler]");
            const images = document.querySelectorAll("img");
            for (const img of images) {

                if (img.width < 150 || img.dataset.handled) {
                    continue;
                }
                verbose && console.log(img, img.width);

                img.dataset.handled = "true";

                const btn = document.createElement("div");
                btn.classList.add("ujs-btn-download");
                btn.dataset.url = img.src;

                btn.addEventListener("click", Features._imageClickHandler);

                let anchor = getNearestElementByType(img, "a");
                // if an image is _opened_ "https://twitter.com/UserName/status/1234567890123456789/photo/1" [fake-url]
                if (!anchor) {
                    anchor = img.parentNode;
                }
                anchor.append(btn);
                if (preventBlinking) {
                    Features._preventBlinking(btn);
                }

                const downloaded = Features._ImageHistory.isDownloaded({
                    id: Tweet.of(btn).id,
                    url: btn.dataset.url
                });
                if (downloaded) {
                    btn.classList.add("ujs-already-downloaded");
                }
            }
        }
        
        static hasBlinkListenerWeakSet;
        static _preventBlinking(clickBtnElem) {
            const weakSet = Features.hasBlinkListenerWeakSet || (Features.hasBlinkListenerWeakSet = new WeakSet());
            let wrapper;
            clickBtnElem.addEventListener("mouseenter", () => {
                if (!weakSet.has(clickBtnElem)) {
                    wrapper = Features._preventBlinkingHandler(clickBtnElem);
                    weakSet.add(clickBtnElem);
                }
            });
            clickBtnElem.addEventListener("mouseleave", () => {
                verbose && console.log("[ujs] Btn mouseleave");
                if (wrapper?.observer?.disconnect) {
                    weakSet.delete(clickBtnElem);
                    wrapper.observer.disconnect();
                }
            });
        }
        static _preventBlinkingHandler(clickBtnElem) {
            let targetNode = clickBtnElem.closest("[aria-labelledby]");
            if (!targetNode) {
                return;
            }
            let config = {attributes: true, subtree: true, attributeOldValue: true};
            const wrapper = {};
            wrapper.observer = new MutationObserver(callback);
            wrapper.observer.observe(targetNode, config);
            
            function callback(mutationsList, observer) {
                for (const mutation of mutationsList) {
                    if (mutation.type === "attributes" && mutation.attributeName === "class") {
                        if (mutation.target.classList.contains("ujs-btn-download")) {
                            return;
                        }
                        // Don't allow to change classList
                        mutation.target.className = mutation.oldValue;
                        
                        // Recreate, to prevent an infinity loop
                        wrapper.observer.disconnect();
                        wrapper.observer = new MutationObserver(callback);
                        wrapper.observer.observe(targetNode, config);
                    }
                }
            }
            return wrapper;
        }
        
        static async _imageClickHandler(event) {
            event.preventDefault();
            event.stopImmediatePropagation();

            const btn = event.currentTarget;
            const url = handleImgUrl(btn.dataset.url);
            verbose && console.log(url);

            function handleImgUrl(url) {
                const urlObj = new URL(url);
                urlObj.searchParams.set("name", "orig");
                return urlObj.toString();
            }

            const {id, author} = Tweet.of(btn);
            verbose && console.log(id, author);

            async function safeFetchResource(url) {
                let fallbackUsed = false;
                retry:
                while (true) {
                    try {
                        return await fetchResource(url);
                    } catch (e) {
                        if (fallbackUsed) {
                            throw "Fallback URL failed";
                        }
                        const _url = new URL(url);
                        _url.searchParams.set("name", "4096x4096");
                        url = _url.href;
                        verbose && console.warn("[safeFetchResource] Fallback URL:", url);
                        fallbackUsed = true;
                        continue retry;
                    }
                }

            }

            btn.classList.add("ujs-downloading");
            const {blob, lastModifiedDate, extension, name} = await safeFetchResource(url);

            const filename = `[twitter] ${author}—${lastModifiedDate}—${id}—${name}.${extension}`;
            download(blob, filename, url);

            const downloaded = btn.classList.contains("already-downloaded");
            if (!downloaded) {
                await Features._ImageHistory.markDownloaded({id, url});
            }
            btn.classList.remove("ujs-downloading");
            btn.classList.add("ujs-downloaded");
        }


        static async videoHandler(preventBlinking) {
            const videos = document.querySelectorAll("video");

            for (const vid of videos) {
                if (vid.dataset.handled) {
                    continue;
                }
                verbose && console.log(vid);
                vid.dataset.handled = "true";

                const btn = document.createElement("div");
                btn.classList.add("ujs-btn-download");
                btn.classList.add("ujs-video");
                btn.addEventListener("click", Features._videoClickHandler);

                let elem = vid.parentNode.parentNode.parentNode;
                elem.after(btn);
                if (preventBlinking) {
                    Features._preventBlinking(btn);
                }

                const id = Tweet.of(btn).id;
                const downloaded = downloadedVideoTweetIds.hasItem(id);
                if (downloaded) {
                    btn.classList.add("ujs-already-downloaded");
                }
            }
        }
        static async _videoClickHandler(event) {
            event.preventDefault();
            event.stopImmediatePropagation();

            const btn = event.currentTarget;
            const {id, author} = Tweet.of(btn);
            const video = await API.getVideoInfo(id); // {bitrate, content_type, url}
            verbose && console.log(video);

            btn.classList.add("ujs-downloading");
            const url = video.url;
            const {blob, lastModifiedDate, extension, name} = await fetchResource(url);

            const filename = `[twitter] ${author}—${lastModifiedDate}—${id}—${name}.${extension}`;
            download(blob, filename, url);

            const downloaded = btn.classList.contains("ujs-already-downloaded");
            if (!downloaded) {
                await downloadedVideoTweetIds.pushItem(id);
            }
            btn.classList.remove("ujs-downloading");
            btn.classList.add("ujs-downloaded");
        }


        static addRequiredCSS() {
            addCSS(getUserScriptCSS());
        }

        // it depends of `directLinks()` use only it after `directLinks()`
        static handleTitle(title) {          
            if (!I18N.QUOTES) { // Unsupported lang, no QUOTES, ON_TWITTER, TWITTER constants
                return;
            }
          
            // if not a opened tweet
            if (!location.href.match(/twitter\.com\/[^\/]+\/status\/\d+/)) {
                return;
            }

            let titleText = title || document.title;
            if (titleText === Features.lastHandledTitle) {
                return;
            }
            Features.originalTitle = titleText;

            const [OPEN_QUOTE, CLOSE_QUOTE] = I18N.QUOTES;
            const urlsToReplace = [
                ...titleText.matchAll(new RegExp(`https:\\/\\/t\\.co\\/[^ ${CLOSE_QUOTE}]+`, "g"))
            ].map(el => el[0]);
            // the last one may be the URL to the tweet // or to an embedded shared URL

            const map = new Map();
            const anchors = document.querySelectorAll(`a[data-redirect^="https://t.co/"]`);
            for (const anchor of anchors) {
                if (urlsToReplace.includes(anchor.dataset.redirect)) {
                    map.set(anchor.dataset.redirect, anchor.href);
                }
            }

            const lastUrl = urlsToReplace.slice(-1)[0];
            let lastUrlIsAttachment = false;
            let attachmentDescription = "";
            if (!map.has(lastUrl)) {
                const a = document.querySelector(`a[href="${lastUrl}?amp=1"]`);
                if (a) {
                    lastUrlIsAttachment = true;
                    attachmentDescription = document.querySelectorAll(`a[href="${lastUrl}?amp=1"]`)[1].innerText;
                    attachmentDescription = attachmentDescription.replaceAll("\n", " — ");
                }
            }


            for (const [key, value] of map.entries()) {
                titleText = titleText.replaceAll(key, value + ` (${key})`);
            }

            titleText = titleText.replace(new RegExp(`${I18N.ON_TWITTER}(?= ${OPEN_QUOTE})`), ":");
            titleText = titleText.replace(new RegExp(`(?<=${CLOSE_QUOTE}) \\\/ ${I18N.TWITTER}$`), "");
            if (!lastUrlIsAttachment) {
                const regExp = new RegExp(`(?<short> https:\\/\\/t\\.co\\/.{6,14})${CLOSE_QUOTE}$`);
                titleText = titleText.replace(regExp, (match, p1, p2, offset, string) => `${CLOSE_QUOTE} —${p1}`);
            } else {
                titleText = titleText.replace(lastUrl, `${lastUrl} (${attachmentDescription})`);
            }
            document.title = titleText; // Note: some characters will be removed automatically (`\n`, extra spaces)
            Features.lastHandledTitle = document.title;
        }
        static lastHandledTitle = "";
        static originalTitle = "";

        static profileUrlCache = new Map();
        static async directLinks() {
            verbose && console.log("[ujs][directLinks]");
            const hasHttp = url => Boolean(url.match(/^https?:\/\//));
            const anchors = xpathAll(`.//a[@dir="ltr" and child::span and not(@data-handled)]`);
            for (const anchor of anchors) {
                const redirectUrl = new URL(anchor.href);
                const shortUrl = redirectUrl.origin + redirectUrl.pathname; // remove "?amp=1"
                anchor.dataset.redirect = shortUrl;
                anchor.dataset.handled = "true";
                anchor.rel = "nofollow noopener noreferrer";

                if (Features.profileUrlCache.has(shortUrl)) {
                    anchor.href = Features.profileUrlCache.get(shortUrl);
                    continue;
                }

                const nodes = xpathAll(`./span[text() != "…"]|./text()`, anchor);
                let url = nodes.map(node => node.textContent).join("");
                
                const doubleProtocolPrefix = url.match(/(?<dup>^https?:\/\/)(?=https?:)/)?.groups.dup;
                if (doubleProtocolPrefix) {
                    url = url.slice(doubleProtocolPrefix.length);
                    const span = anchor.querySelector(`[aria-hidden="true"]`);
                    if (hasHttp(span.textContent)) { // Fix Twitter's bug related to text copying
                        span.style = "display: none;";
                    }
                }
                
                anchor.href = url;
                
                if (anchor.dataset?.testid === "UserUrl") {
                    const href = anchor.getAttribute("href");
                    const profileUrl = hasHttp(href) ? href : "https://" + href;
                    anchor.href = profileUrl;
                    verbose && console.log("[ujs][directLinks][UserUrl]", profileUrl);
                    
                    // Restore if URL's text content is too long
                    if (anchor.textContent.endsWith("…")) {
                        anchor.href = shortUrl;
                        
                        try {
                            const author = location.pathname.slice(1).match(/[^\/]+/)[0];
                            const expanded_url = await API.getUserInfo(author); // todo: make lazy
                            anchor.href = expanded_url;
                            Features.profileUrlCache.set(shortUrl, expanded_url);
                        } catch (e) {
                            verbose && console.error(e);
                        }
                    }
                }
            }
            if (anchors.length) {
                Features.handleTitle(Features.originalTitle);
            }
        }

        // Do NOT throttle it
        static expandSpoilers() {
            const main = document.querySelector("main[role=main]");
            if (!main) {
                return;
            }
          
            if (!I18N.YES_VIEW_PROFILE) { // Unsupported lang, no YES_VIEW_PROFILE, SHOW_NUDITY, VIEW constants
                return;
            }

            const a = main.querySelectorAll("[data-testid=primaryColumn] [role=button]");
            if (a) {
                const elems = [...a];
                const button = elems.find(el => el.textContent === I18N.YES_VIEW_PROFILE);
                if (button) {
                    button.click();
                }
                
                // "Content warning: Nudity"
                // "The Tweet author flagged this Tweet as showing sensitive content.""
                // "Show"
                const buttonShow = elems.find(el => el.textContent === I18N.SHOW_NUDITY);
                if (buttonShow) {
                    //const verifing = a.previousSibling.textContent.includes("Nudity"); // todo?
                    //if (verifing) {
                        buttonShow.click();
                    //}
                }
            }
            
            // todo: expand spoiler commentary in photo view mode (.../photo/1)
            const b = main.querySelectorAll("article [role=presentation] div[role=button]");
            if (b) {
                const elems = [...b];
                const buttons = elems.filter(el => el.textContent === I18N.VIEW);
                if (buttons.length) {
                    buttons.forEach(el => el.click());
                }
            }
        }

        static hideSignUpSection() { // "New to Twitter?"
            if (!I18N.SIGNUP) {// Unsupported lang, no SIGNUP constant
                return;
            }
            const elem = document.querySelector(`section[aria-label="${I18N.SIGNUP}"][role=region]`);
            if (elem) {
                elem.parentNode.classList.add("ujs-hidden");
            }
        }

        // Call it once.
        // "Don’t miss what’s happening" if you are not logged in.
        // It looks that `#layers` is used only for this bar.
        static hideSignUpBottomBarAndMessages(doNotPlayVideosAutomatically) {
            if (doNotPlayVideosAutomatically) {
                addCSS(`
                    #layers > div:nth-child(1) {
                        display: none;
                    }
                `);
            } else {
                addCSS(`
                    #layers > div:nth-child(1) {
                        height: 1px;
                        opacity: 0;
                    }
                `);
            }
        }

        // "Trends for you"
        static hideTrends() {
            if (!I18N.TRENDS) { // Unsupported lang, no TRENDS constant
                return;
            }
            addCSS(`
                [aria-label="${I18N.TRENDS}"]
                {
                    display: none;
                }
            `);
        }
        static highlightVisitedLinks() {
            addCSS(`
                a:visited {
                    color: darkorange;
                }
            `);
        }

        // Hides "TOPICS TO FOLLOW" only in the right column, NOT in timeline.
        // Use it once. To prevent blinking.
        static hideTopicsToFollowInstantly() {
            if (!I18N.TOPICS_TO_FOLLOW) { // Unsupported lang, no TOPICS_TO_FOLLOW constant
                return;
            }
            addCSS(`
                div[aria-label="${I18N.TOPICS_TO_FOLLOW}"] {
                    display: none;
                }
            `);
        }
        // Hides container and "separator line"
        static hideTopicsToFollow() {
            if (!I18N.TOPICS_TO_FOLLOW) { // Unsupported lang, no TOPICS_TO_FOLLOW constant
                return;
            }
          
            const elem = xpath(`.//section[@role="region" and child::div[@aria-label="${I18N.TOPICS_TO_FOLLOW}"]]/../..`);
            if (!elem) {
                return;
            }
            elem.classList.add("ujs-hidden");

            elem.previousSibling.classList.add("ujs-hidden"); // a "separator line" (empty element of "TRENDS", for example)
            // in fact it's a hack // todo rework // may hide "You might like" section [bug]
        }

        // todo split to two methods
        // todo fix it, currently it works questionably
        // not tested with non eng langs
        static footerHandled = false;
        static hideAndMoveFooter() { // "Terms of Service   Privacy Policy   Cookie Policy"
            let footer = document.querySelector(`main[role=main] nav[aria-label=${I18N.FOOTER}][role=navigation]`);
            const nav  = document.querySelector("nav[aria-label=Primary][role=navigation]"); // I18N."Primary" [?]

            if (footer) {
                footer = footer.parentNode;
                const separatorLine = footer.previousSibling;

                if (Features.footerHandled) {
                    footer.remove();
                    separatorLine.remove();
                    return;
                }

                nav.append(separatorLine);
                nav.append(footer);
                footer.classList.add("ujs-show-on-hover");
                separatorLine.classList.add("ujs-show-on-hover");

                Features.footerHandled = true;
            }
        }
    }
    return Features;
}

// --- Twitter.RequiredCSS --- //
function getUserScriptCSS() {
    const labelText = I18N.IMAGE || "Image";
  
    // By default the scroll is showed all time, since <html style="overflow-y: scroll;>,
    // so it works — no need to use `getScrollbarWidth` function from SO (13382516).
    const scrollbarWidth = window.innerWidth - document.body.offsetWidth;
  
    const css = `
        .ujs-hidden {
            display: none;
        }
        .ujs-no-scroll {
            overflow-y: hidden;
        }
        .ujs-scroll-initial {
            overflow-y: initial!important;
        }
        .ujs-scrollbar-width-margin-right {
            margin-right: ${scrollbarWidth}px;
        }
        
        .ujs-show-on-hover:hover {
            opacity: 1;
            transition: opacity 1s ease-out 0.1s;
        }
        .ujs-show-on-hover {
            opacity: 0;
            transition: opacity 0.5s ease-out;
        }
        
        .ujs-btn-download {
            cursor: pointer;
            top: 0.5em;
            left: 0.5em;
            width: 33px;
            height: 33px;
            background: #e0245e; /*red*/
            opacity: 0;
            position: absolute;
            border-radius: 0.3em;
            background-image: linear-gradient(to top, rgba(0,0,0,0.15), rgba(0,0,0,0.05));
        }
        article[role=article]:hover .ujs-btn-download {
            opacity: 1;
        }
        div[aria-label="${labelText}"]:hover .ujs-btn-download {
            opacity: 1;
        }
        
        .ujs-btn-download.ujs-downloaded {
            background: #4caf50; /*green*/
            background-image: linear-gradient(to top, rgba(0,0,0,0.15), rgba(0,0,0,0.05));
            opacity: 1;
        }
        .ujs-btn-download.ujs-video {
            left: calc(0.5em + 33px + 3px);
        }
        article[role=article]:hover .ujs-already-downloaded:not(.ujs-downloaded) {
            background: #1da1f2; /*blue*/
            background-image: linear-gradient(to top, rgba(0,0,0,0.15), rgba(0,0,0,0.05));
        }
        div[aria-label="${labelText}"]:hover .ujs-already-downloaded:not(.ujs-downloaded) {
            background: #1da1f2; /*blue*/
            background-image: linear-gradient(to top, rgba(0,0,0,0.15), rgba(0,0,0,0.05));
        }
        
        /* -------------------------------------------------------- */
        /* Shadow the button on hover, active and while downloading */
        .ujs-btn-download:hover {
            background-image: linear-gradient(to top, rgba(0,0,0,0.25), rgba(0,0,0,0.05));
        }
        .ujs-btn-download:active {
            background-image: linear-gradient(to top, rgba(0,0,0,0.55), rgba(0,0,0,0.25));
        }
        .ujs-btn-download.ujs-downloading {
            background-image: linear-gradient(to top, rgba(0,0,0,0.45), rgba(0,0,0,0.15));
        }
        
        article[role=article]:hover  .ujs-already-downloaded:not(.ujs-downloaded):hover {
            background-image: linear-gradient(to top, rgba(0,0,0,0.25), rgba(0,0,0,0.05));
        }
        article[role=article]:hover  .ujs-already-downloaded:not(.ujs-downloaded):active {
            background-image: linear-gradient(to top, rgba(0,0,0,0.55), rgba(0,0,0,0.25));
        }
        article[role=article]:hover  .ujs-already-downloaded:not(.ujs-downloaded).ujs-downloading {
            background-image: linear-gradient(to top, rgba(0,0,0,0.45), rgba(0,0,0,0.15));
        }
        
        div[aria-label="${labelText}"]:hover .ujs-already-downloaded:not(.ujs-downloaded):hover {
            background-image: linear-gradient(to top, rgba(0,0,0,0.25), rgba(0,0,0,0.05));
        }
        div[aria-label="${labelText}"]:hover .ujs-already-downloaded:not(.ujs-downloaded):active {
            background-image: linear-gradient(to top, rgba(0,0,0,0.55), rgba(0,0,0,0.25));
        }
        div[aria-label="${labelText}"]:hover .ujs-already-downloaded:not(.ujs-downloaded).ujs-downloading {
            background-image: linear-gradient(to top, rgba(0,0,0,0.45), rgba(0,0,0,0.15));
        }
        
        /* -------------------------------------------------------- */
        
        `;
    return css.replaceAll(" ".repeat(8), "");
}

/*
Features depend on:

addRequiredCSS: IMAGE

expandSpoilers:     YES_VIEW_PROFILE,   SHOW_NUDITY,  VIEW
handleTitle:        QUOTES,             ON_TWITTER,   TWITTER
hideSignUpSection:  SIGNUP
hideTrends:         TRENDS
hideTopicsToFollowInstantly: TOPICS_TO_FOLLOW, 
hideTopicsToFollow:          TOPICS_TO_FOLLOW, 

[unused]
hideAndMoveFooter:  FOOTER
*/

// --- Twitter.LangConstants --- //
function getLanguageConstants() { //todo: "de", "fr"
    const defaultQuotes = [`"`, `"`];

    const SUPPORTED_LANGUAGES = ["en",                     "ru",                     "es",                                 "zh",               "ja",                       ];  
    // texts
    const VIEW                = ["View",                   "Посмотреть",             "Ver",                                "查看",             "表示",                      ];
    const YES_VIEW_PROFILE    = ["Yes, view profile",      "Да, посмотреть профиль", "Sí, ver perfil",                     "是，查看个人资料",   "プロフィールを表示する",      ];    
    const SHOW_NUDITY         = ["Show",                   "Показать",               "Mostrar",                            "显示",              "表示",                     ];
    // aria-label texts
    const IMAGE               = ["Image",                  "Изображение",            "Imagen",                             "图像",              "画像",                     ];
    const SIGNUP              = ["Sign up",                "Зарегистрироваться",     "Regístrate",                         "注册",             "アカウント作成",              ];
    const TRENDS              = ["Timeline: Trending now", "Лента: Актуальные темы", "Cronología: Tendencias del momento", "时间线：当前趋势",   "タイムライン: トレンド",      ];
    const TOPICS_TO_FOLLOW    = ["Timeline: ",             "Лента: ",                "Cronología: ",                       "时间线：", /*[1]*/  "タイムライン: ",  /*[1]*/    ];
    const WHO_TO_FOLLOW       = ["Who to follow",          "Кого читать",            "A quién seguir",                     "推荐关注",          "おすすめユーザー"             ];
    const FOOTER              = ["Footer",                 "Нижний колонтитул",      "Pie de página",                      "页脚",             "フッター",                   ];
    // *1 — it's a suggestion, need to recheck. But I can't find a page where I can check it. Was it deleted?  
    // document.title "{AUTHOR}{ON_TWITTER} {QUOTES[0]}{TEXT}{QUOTES[1]} / {TWITTER}"
    const QUOTES              = [defaultQuotes,            [`«`, `»`],               defaultQuotes,                        defaultQuotes,      [`「`, `」`],                ];
    const ON_TWITTER          = [" on Twitter:",           " в Твиттере:",           " en Twitter:",                       " 在 Twitter:",      "さんはTwitterを使っています", ];
    const TWITTER             = ["Twitter",                "Твиттер",                "Twitter",                            "Twitter",          "Twitter",                  ];
    
  
    const lang = document.querySelector("html").getAttribute("lang");
    const langIndex = SUPPORTED_LANGUAGES.indexOf(lang);

    return {
        SUPPORTED_LANGUAGES,
        VIEW: VIEW[langIndex],
        YES_VIEW_PROFILE: YES_VIEW_PROFILE[langIndex],
        SIGNUP: SIGNUP[langIndex],
        TRENDS: TRENDS[langIndex],
        TOPICS_TO_FOLLOW: TOPICS_TO_FOLLOW[langIndex],
        WHO_TO_FOLLOW: WHO_TO_FOLLOW[langIndex],
        FOOTER: FOOTER[langIndex],
        QUOTES: QUOTES[langIndex],
        ON_TWITTER: ON_TWITTER[langIndex],
        TWITTER: TWITTER[langIndex],
        IMAGE: IMAGE[langIndex],
        SHOW_NUDITY: SHOW_NUDITY[langIndex],
    }
}

// --- Twitter.Tweet --- //
function hoistTweet() {
    class Tweet {
        constructor(elem) {
            this.elem = elem;
            this.url = Tweet.getUrl(elem);
        }
        static of(innerElem) {
            const elem = getParentWithSiblingDataset(innerElem, "testid", "tweet");
            if (!elem) { // opened image
                verbose && console.log("no-tweet elem");
            }
            return new Tweet(elem);
        }
        static getUrl(elem) {
            if (!elem) { // if opened image
                return location.href;
            }

            const tweetAnchor = [...elem.querySelectorAll("a")].find(el => {
                return el.childNodes[0]?.nodeName === "TIME";
            });

            if (tweetAnchor) {
                return tweetAnchor.href;
            }
            // else if selected tweet
            return location.href;
        }

        get author() {
            return this.url.match(/(?<=twitter\.com\/).+?(?=\/)/)?.[0];
        }
        get id() {
            return this.url.match(/(?<=\/status\/)\d+/)?.[0];
        }
    }
    return Tweet;
}

// --- Twitter.API --- //
function hoistAPI() {
    class API {
        static guestToken = getCookie("gt");
        static csrfToken  = getCookie("ct0");  // todo: lazy — not available at the first run
        // Guest/Suspended account Bearer token
        static guestAuthorization = "Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA";

        // Seems to be outdated at 2022.05
        static async _requestBearerToken() {
            const scriptSrc = [...document.querySelectorAll("script")]
                .find(el => el.src.match(/https:\/\/abs\.twimg\.com\/responsive-web\/client-web\/main[\w\d\.]*\.js/)).src;

            let text;
            try {
                text = await (await fetch(scriptSrc)).text();
            } catch (e) {
                console.error(e, scriptSrc);
                throw e;
            }

            const authorizationKey = text.match(/(?<=")AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D.+?(?=")/)[0];
            const authorization = `Bearer ${authorizationKey}`;

            return authorization;
        }

        static async getAuthorization() {
            if (!API.authorization) {
                API.authorization = await API._requestBearerToken();
            }
            return API.authorization;
        }

        static async apiRequest(url) {
            const _url = url.toString();
            verbose && console.log("[ujs][apiRequest]", _url);
            
            // Hm... it always is the same. Even for a logged user.
            // const authorization = API.guestToken ? API.guestAuthorization : await API.getAuthorization();
            const authorization = API.guestAuthorization;

            // for debug
            verbose && sessionStorage.setItem("guestAuthorization", API.guestAuthorization);
            verbose && sessionStorage.setItem("authorization", API.authorization);
            verbose && sessionStorage.setItem("x-csrf-token", API.csrfToken);
            verbose && sessionStorage.setItem("x-guest-token", API.guestToken);

            const headers = new Headers({
                authorization,
                "x-csrf-token": API.csrfToken,
            });
            if (API.guestToken) {
                headers.append("x-guest-token", API.guestToken);
            } else { // may be skipped
                headers.append("x-twitter-active-user", "yes");
                headers.append("x-twitter-auth-type", "OAuth2Session");
            }

            let json;
            try {
                const response = await fetch(_url, {headers});
                json = await response.json();
            } catch (e) {
                console.error(e, _url);
                throw e;
            }

            verbose && console.log("[ujs][apiRequest]", JSON.stringify(json, null, " "));
            // 429 - [{code: 88, message: "Rate limit exceeded"}] — for suspended accounts
            
            return json;
        }

        // @return {bitrate, content_type, url}
        static async getVideoInfo(tweetId) {
         // const url = new URL(`https://api.twitter.com/2/timeline/conversation/${tweetId}.json`); // only for suspended/anon
            const url = new URL(`https://twitter.com/i/api/2/timeline/conversation/${tweetId}.json`);
            url.searchParams.set("tweet_mode", "extended");

            const json = await API.apiRequest(url);
            const tweetData = json.globalObjects.tweets[tweetId];
            const videoVariants = tweetData.extended_entities.media[0].video_info.variants;
            verbose && console.log(videoVariants);


            const video = videoVariants
                .filter(el => el.bitrate !== undefined) // if content_type: "application/x-mpegURL" // .m3u8
                .reduce((acc, cur) => cur.bitrate > acc.bitrate ? cur : acc);
            return video;
        }

        static async getUserInfo(username) {
            const qHash = "Bhlf1dYJ3bYCKmLfeEQ31A"; // todo: change
            const variables = JSON.stringify({"screen_name": username, "withSafetyModeUserFields": true, "withSuperFollowsUserFields": true});
            const url = `https://twitter.com/i/api/graphql/${qHash}/UserByScreenName?variables=${encodeURIComponent(variables)}`;
            const json = await API.apiRequest(url);
            verbose && console.log("[getUserInfo]", json);
            return json.data.user.result.legacy.entities.url?.urls[0].expanded_url;
        }
    }
    return API;
}

// ---------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------
// --- Common Utils --- //

// --- LocalStorage util class --- //
function hoistLS(settings = {}) {
    const {
        verbose, // debug "messages" in the document.title
    } = settings;
    class LS {
        constructor(name) {
            this.name = name;
        }
        getItem(defaultValue) {
            return LS.getItem(this.name, defaultValue);
        }
        setItem(value) {
            LS.setItem(this.name, value);
        }
        removeItem() {
            LS.removeItem(this.name);
        }
        async pushItem(value) {  // array method
            await LS.pushItem(this.name, value);
        }
        async popItem(value) {   // array method
            await LS.popItem(this.name, value);
        }
        hasItem(value) {         // array method
            return LS.hasItem(this.name, value);
        }

        static getItem(name, defaultValue) {
            const value = localStorage.getItem(name);
            if (value === undefined) {
                return undefined;
            }
            if (value === null) { // when there is no such item
                LS.setItem(name, defaultValue);
                return defaultValue;
            }
            return JSON.parse(value);
        }
        static setItem(name, value) {
            localStorage.setItem(name, JSON.stringify(value));
        }
        static removeItem(name) {
            localStorage.removeItem(name);
        }
        static async pushItem(name, value) {
            const array = LS.getItem(name, []);
            array.push(value);
            LS.setItem(name, array);

            //sanity check
            await sleep(50);
            if (!LS.hasItem(name, value)) {
                if (verbose) {
                    document.title = "🟥" + document.title;
                }
                await LS.pushItem(name, value);
            }
        }
        static async popItem(name, value) { // remove from an array
            const array = LS.getItem(name, []);
            if (array.indexOf(value) !== -1) {
                array.splice(array.indexOf(value), 1);
                LS.setItem(name, array);

                //sanity check
                await sleep(50);
                if (LS.hasItem(name, value)) {
                    if (verbose) {
                        document.title = "🟨" + document.title;
                    }
                    await LS.popItem(name, value);
                }
            }
        }
        static hasItem(name, value) { // has in array
            const array = LS.getItem(name, []);
            return array.indexOf(value) !== -1;
        }
    }
    return LS;
}

// --- Just groups them in a function for the convenient code looking --- //
function getUtils({verbose}) {
    function sleep(time) {
        return new Promise(resolve => setTimeout(resolve, time));
    }

    async function fetchResource(url) {
        try {
            const response = await fetch(url, {
                cache: "force-cache",
            });
            const lastModifiedDateSeconds = response.headers.get("last-modified");
            const contentType = response.headers.get("content-type");

            const lastModifiedDate = dateToDayDateString(lastModifiedDateSeconds);
            const extension = extensionFromMime(contentType);
            const blob = await response.blob();

            // https://pbs.twimg.com/media/AbcdEFgijKL01_9?format=jpg&name=orig                                     -> AbcdEFgijKL01_9
            // https://pbs.twimg.com/ext_tw_video_thumb/1234567890123456789/pu/img/Ab1cd2345EFgijKL.jpg?name=orig   -> Ab1cd2345EFgijKL.jpg
            // https://video.twimg.com/ext_tw_video/1234567890123456789/pu/vid/946x720/Ab1cd2345EFgijKL.mp4?tag=10  -> Ab1cd2345EFgijKL.mp4
            const _url = new URL(url);
            const {filename} = (_url.origin + _url.pathname).match(/(?<filename>[^\/]+$)/).groups;

            const {name} = filename.match(/(?<name>^[^\.]+)/).groups;
            return {blob, lastModifiedDate, contentType, extension, name};
        } catch (error) {
            verbose && console.error("[fetchResource]", url, error);
            throw error;
        }
    }

    function extensionFromMime(mimeType) {
        let extension = mimeType.match(/(?<=\/).+/)[0];
        extension = extension === "jpeg" ? "jpg" : extension;
        return extension;
    }

    // the original download url will be posted as hash of the blob url, so you can check it in the download manager's history
    function download(blob, name, url) {
        const anchor = document.createElement("a");
        anchor.setAttribute("download", name || "");
        const blobUrl = URL.createObjectURL(blob);
        anchor.href = blobUrl + (url ? ("#" + url) : "");
        anchor.click();
        setTimeout(() => URL.revokeObjectURL(blobUrl), 30000);
    }

    // "Sun, 10 Jan 2021 22:22:22 GMT" -> "2021.01.10"
    function dateToDayDateString(dateValue, utc = true) {
        const _date = new Date(dateValue);
        function pad(str) {
            return str.toString().padStart(2, "0");
        }
        const _utc = utc ? "UTC" : "";
        const year  = _date[`get${_utc}FullYear`]();
        const month = _date[`get${_utc}Month`]() + 1;
        const date  = _date[`get${_utc}Date`]();

        return year + "." + pad(month) + "." + pad(date);
    }


    function addCSS(css) {
        const styleElem = document.createElement("style");
        styleElem.textContent = css;
        document.body.append(styleElem);
        return styleElem;
    }


    function getCookie(name) {
        verbose && console.log(document.cookie);
        const regExp = new RegExp(`(?<=${name}=)[^;]+`);
        return document.cookie.match(regExp)?.[0];
    }

    function throttle(runnable, time = 50) {
        let waiting = false;
        let queued = false;
        let context;
        let args;

        return function() {
            if (!waiting) {
                waiting = true;
                setTimeout(function() {
                    if (queued) {
                        runnable.apply(context, args);
                        context = args = undefined;
                    }
                    waiting = queued = false;
                }, time);
                return runnable.apply(this, arguments);
            } else {
                queued = true;
                context = this;
                args = arguments;
            }
        }
    }
    function throttleWithResult(func, time = 50) {
        let waiting = false;
        let args;
        let context;
        let timeout;
        let promise;

        return async function() {
            if (!waiting) {
                waiting = true;
                timeout = new Promise(async resolve => {
                    await sleep(time);
                    waiting = false;
                    resolve();
                });
                return func.apply(this, arguments);
            } else {
                args = arguments;
                context = this;
            }

            if (!promise) {
                promise = new Promise(async resolve => {
                    await timeout;
                    const result = func.apply(context, args);
                    args = context = promise = undefined;
                    resolve(result);
                });
            }
            return promise;
        }
    }


    function xpath(path, node = document) {
        let xPathResult = document.evaluate(path, node, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
        return xPathResult.singleNodeValue;
    }
    function xpathAll(path, node = document) {
        let xPathResult = document.evaluate(path, node, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);
        const nodes = [];
        try {
            let node = xPathResult.iterateNext();

            while (node) {
                nodes.push(node);
                node = xPathResult.iterateNext();
            }
            return nodes;
        }
        catch (e) {
            // todo need investigate it
            console.error(e); // "The document has mutated since the result was returned."
            return [];
        }
    }


    function getNearestElementByType(elem, type) {
        const parent = elem.parentNode;
        if (parent === document) {
            return null;
        }
        if (parent.nodeName === type.toUpperCase()) {
            return parent;
        }
        return getNearestElementByType(parent, type);
    }
    function getParentWithSiblingDataset(node, name, value) {
        const parent = node.parentNode;
        if (parent === document) {
            return null;
        }
        // console.log(parent, parent.childNodes);
        const elem = [...parent.childNodes].find(el => {
            if (el.dataset?.[name] === value) {
                return true;
            }
        });
        if (!elem) {
            return getParentWithSiblingDataset(parent, name, value);
        }
        return parent;
    }

    return {
        sleep, fetchResource, extensionFromMime, download, dateToDayDateString,
        addCSS,
        getCookie,
        throttle, throttleWithResult,
        xpath, xpathAll,
        getNearestElementByType, getParentWithSiblingDataset,
    }
}


// ---------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------
