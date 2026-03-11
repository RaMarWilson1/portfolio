// attribution.js
(function () {
    'use strict';

    const DEFAULT_CONFIG = {
        cookieDomain: 'beehiiv.com',
        firstTouchCookie: 'attr_first',
        lastTouchCookie: 'attr_last',
        debug: false,
    };

    // Debug logging utility
    const debugLog = (config, ...args) => {
        if (config.debug) {
            console.log('[Attribution]', ...args);
        }
    };

    const debugWarn = (config, ...args) => {
        if (config.debug) {
            console.warn('[Attribution]', ...args);
        }
    };

    const debugError = (config, ...args) => {
        if (config.debug) {
            console.error('[Attribution]', ...args);
        }
    };

    // Format date like Attributor.js does
    const formatDate = () => {
        const date = new Date();
        const day = date.getDate();
        let month = date.getMonth() + 1;
        month = month < 10 ? `0${month}` : month;
        return `${date.getFullYear()}-${month}-${day}`;
    };

    // Parse URL parameters (matching Attributor.js behavior)
    const parseUrlParameters = (url) => {
        const params = url.searchParams;
        const data = {};

        // Parse UTMs (matching Attributor.js fieldMap)
        if (params.has('utm_source')) data.source = params.get('utm_source');
        if (params.has('utm_medium')) data.medium = params.get('utm_medium');
        if (params.has('utm_campaign')) data.campaign = params.get('utm_campaign');
        if (params.has('utm_term')) data.term = params.get('utm_term');
        if (params.has('utm_content')) data.content = params.get('utm_content');
        if (params.has('utm_id')) data.id = params.get('utm_id');
        if (params.has('utm_source_platform')) data.source_platform = params.get('utm_source_platform');
        if (params.has('utm_marketing_tactic')) data.marketing_tactic = params.get('utm_marketing_tactic');
        if (params.has('utm_creative_format')) data.creative_format = params.get('utm_creative_format');
        if (params.has('utm_adgroup')) data.adgroup = params.get('utm_adgroup');

        return data;
    };

    // Detect source from click IDs (matching Attributor.js logic)
    const detectClickIdSource = (params) => {
        const clickIdMap = {
            gclid: 'google',
            gclsrc: 'google',
            dclid: 'google',
            gbraid: 'google',
            wbraid: 'google',
            fbclid: 'facebook',
            msclkid: 'bing',
            li_fat_id: 'linkedin',
            ttclid: 'tiktok',
            twclid: 'twitter',
        };

        for (const [param, source] of Object.entries(clickIdMap)) {
            if (params.has(param)) {
                return { source };
            }
        }

        return null;
    };

    // Parse referrer information (matching Attributor.js logic)
    const parseReferrer = (referrer, cookieDomain) => {
        if (!referrer) return null;

        try {
            const referrerUrl = new URL(referrer);
            const hostname = referrerUrl.hostname.toLowerCase();

            // Same domain = direct (don't count as referrer)
            if (hostname.indexOf(cookieDomain) > -1) {
                return null;
            }

            // Search engines (matching Attributor.js patterns)
            const searchEngines = {
                'google': 'organic',
                'bing': 'organic',
                'yahoo': 'organic',
                'duckduckgo': 'organic',
                'ecosia': 'organic',
                'ask': 'organic',
                'aol': 'organic',
                'baidu': 'organic',
                'yandex': 'organic',
                'lycos': 'organic',
            };

            // Social networks
            const socialNetworks = {
                'linkedin': 'social',
                'facebook': 'social',
                'twitter': 'social',
                'instagram': 'social',
            };

            // Check search engines
            for (const [domain, medium] of Object.entries(searchEngines)) {
                const pattern = new RegExp(domain);
                if (pattern.test(hostname)) {
                    return { source: domain, medium };
                }
            }

            // Check social networks
            for (const [domain, medium] of Object.entries(socialNetworks)) {
                const pattern = new RegExp(domain);
                if (pattern.test(hostname)) {
                    return { source: domain, medium };
                }
            }

            // Default to referral
            return { source: referrerUrl.hostname, medium: 'referral' };
        } catch (error) {
            return null;
        }
    };

    // Capture attribution from REFERRER (where they came from) - this becomes "last touch"
    const captureAttribution = (config = DEFAULT_CONFIG) => {
        const currentUrl = new URL(window.location.href);
        const currentParams = currentUrl.searchParams;
        const referrer = document.referrer;

        debugLog(config, 'Capturing attribution - Current:', currentUrl.href, 'Referrer:', referrer);

        // Start with defaults
        let data = {
            source: '(direct)',
            medium: '(none)',
            campaign: '(not set)',
            term: '(not provided)',
            content: '(not set)',
            id: '(not set)',
            source_platform: '(not set)',
            marketing_tactic: '(not set)',
            creative_format: '(not set)',
            adgroup: '(not set)',
            lp: window.location.hostname + window.location.pathname, // Fallback to current page
            date: formatDate(),
            timestamp: Date.now(),
        };

        // If we have a referrer, capture attribution from the REFERRER (where they came from)
        if (referrer) {
            try {
                const referrerUrl = new URL(referrer);
                const referrerParams = referrerUrl.searchParams;

                debugLog(config, 'Parsing referrer URL:', referrerUrl.href);

                // Build attribution data from referrer
                data = {
                    source: '(direct)',
                    medium: '(none)',
                    campaign: '(not set)',
                    term: '(not provided)',
                    content: '(not set)',
                    id: '(not set)',
                    source_platform: '(not set)',
                    marketing_tactic: '(not set)',
                    creative_format: '(not set)',
                    adgroup: '(not set)',
                    lp: referrerUrl.hostname + referrerUrl.pathname, // The referrer page (where they came from)
                    date: formatDate(),
                    timestamp: Date.now(),
                };

                // Parse UTMs from referrer URL first
                const referrerUrlData = parseUrlParameters(referrerUrl);
                Object.assign(data, referrerUrlData);

                debugLog(config, 'Parsed UTMs from referrer:', referrerUrlData);

                // If no UTMs in referrer, try to detect from click IDs in referrer
                if (data.source === '(direct)' && data.medium === '(none)') {
                    const clickIdSource = detectClickIdSource(referrerParams);
                    if (clickIdSource) {
                        data.source = clickIdSource.source;
                        data.medium = 'cpc';
                        debugLog(config, 'Detected source from click ID in referrer:', clickIdSource);
                    } else {
                        // Parse referrer's referrer (where did they originally come from)
                        const referrerData = parseReferrer(referrer, config.cookieDomain);
                        if (referrerData) {
                            data.source = referrerData.source;
                            data.medium = referrerData.medium;
                            debugLog(config, 'Parsed referrer attribution:', referrerData);
                        } else {
                            debugLog(config, 'Referrer is same domain, treating as direct');
                        }
                    }
                }
            } catch (error) {
                debugError(config, 'Failed to parse referrer URL:', error);
                // Fall back to current page attribution
            }
        }

        // Allow UTMs from current page to override (in case they're passed through)
        const currentUrlData = parseUrlParameters(currentUrl);
        if (Object.keys(currentUrlData).length > 0) {
            debugLog(config, 'UTMs found on current page, overriding referrer attribution:', currentUrlData);
            Object.assign(data, currentUrlData);
            // Update lp to current page if UTMs are present (they're explicitly passing attribution)
            data.lp = currentUrl.hostname + currentUrl.pathname;
        }

        // If no referrer and no UTMs, try to detect from click IDs on current page
        if (!referrer && data.source === '(direct)' && data.medium === '(none)') {
            const clickIdSource = detectClickIdSource(currentParams);
            if (clickIdSource) {
                data.source = clickIdSource.source;
                data.medium = 'cpc';
                debugLog(config, 'Detected source from click ID on current page:', clickIdSource);
            }
        }

        debugLog(config, 'Final attribution data (from referrer):', data);
        return data;
    };

    // Set cookie helper (with SameSite and Secure fixes)
    const setCookie = (name, value, expires, unit, config = DEFAULT_CONFIG) => {
        try {
            const expireDate = new Date();
            if (unit === 'days') {
                expireDate.setDate(expireDate.getDate() + expires);
            } else {
                expireDate.setTime(expireDate.getTime() + expires * 60 * 1000);
            }

            const isSecure = location.protocol === 'https:';
            const cookieValue = encodeURIComponent(JSON.stringify(value));

            // For production (beehiiv.com), use domain=.beehiiv.com for subdomain sharing
            // For preview deployments (vercel.app, etc.), don't set domain (scopes to exact hostname)
            const currentHostname = window.location.hostname;
            // If cookieDomain matches current hostname exactly, don't set domain (for preview deployments)
            // Otherwise, use domain=.cookieDomain (for production subdomain sharing)
            const domainPart = config.cookieDomain === currentHostname
                ? ''
                : `; domain=.${config.cookieDomain}`;

            const cookieString = `${name}=${cookieValue}${domainPart}; path=/; expires=${expireDate.toUTCString()}; SameSite=Lax${isSecure ? '; Secure' : ''}`;

            // Check cookie size (4KB limit)
            if (cookieString.length > 4096) {
                debugWarn(config, `Cookie ${name} exceeds 4KB limit (${cookieString.length} bytes)`);
                return false;
            }

            document.cookie = cookieString;
            debugLog(config, `Set cookie ${name}:`, { expires: expireDate.toISOString(), size: cookieString.length, domain: domainPart || 'current hostname' });
            return true;
        } catch (error) {
            debugError(config, `Failed to set cookie ${name}:`, error);
            return false;
        }
    };

    // Get cookie helper
    const getCookie = (name, config = DEFAULT_CONFIG) => {
        try {
            const cookies = document.cookie.split(';');
            const cookie = cookies.find((c) => c.trim().startsWith(`${name}=`));

            if (!cookie) {
                debugLog(config, `Cookie ${name} not found`);
                return null;
            }

            const value = cookie.split('=').slice(1).join('=');
            const parsed = JSON.parse(decodeURIComponent(value));
            debugLog(config, `Retrieved cookie ${name}:`, parsed);
            return parsed;
        } catch (error) {
            debugError(config, `Failed to parse cookie ${name}:`, error);
            return null;
        }
    };

    // Store attribution cookies (matching Attributor.js logic)
    const storeAttribution = (data, config = DEFAULT_CONFIG) => {
        debugLog(config, 'Storing attribution:', data);

        const firstTouch = getCookie(config.firstTouchCookie, config);
        const lastTouch = getCookie(config.lastTouchCookie, config);

        let firstTouchStored = false;
        let lastTouchStored = false;

        // Store first touch if it doesn't exist (400 days like Attributor.js)
        if (!firstTouch) {
            firstTouchStored = setCookie(config.firstTouchCookie, data, 400, 'days', config);
            debugLog(config, 'First touch stored:', firstTouchStored);
        } else {
            debugLog(config, 'First touch already exists, skipping');
        }

        // Store last touch - SIMPLY ALWAYS UPDATE ON EVERY PAGE LOAD
        // If navigating directly (same domain) and we have a previous non-direct attribution,
        // preserve the original source/medium but update everything else
        if (data.source === '(direct)' && lastTouch && lastTouch.source !== '(direct)') {
            // Keep the original attribution source/medium, but update page/timestamp
            const updatedData = {
                ...lastTouch,
                lp: data.lp,
                date: data.date,
                timestamp: data.timestamp,
            };
            lastTouchStored = setCookie(config.lastTouchCookie, updatedData, config.sessionTimeout || 30, 'minutes', config);
        } else {
            // Update with current page data - SIMPLE, ALWAYS UPDATE
            lastTouchStored = setCookie(config.lastTouchCookie, data, config.sessionTimeout || 30, 'minutes', config);
        }

        debugLog(config, 'Last touch updated:', {
            stored: lastTouchStored,
            newData: data.source === '(direct)' && lastTouch && lastTouch.source !== '(direct)'
                ? { ...lastTouch, lp: data.lp, date: data.date, timestamp: data.timestamp }
                : data
        });

        return { firstTouchStored, lastTouchStored };
    };

    // Track initialization using window to persist across script re-runs
    if (typeof window !== 'undefined' && !window.__attributionInitialized) {
        window.__attributionInitialized = false;
    }

    // Initialize attribution tracking
    const initializeAttribution = (userConfig = {}) => {
        // Prevent double initialization using window property
        if (typeof window !== 'undefined' && window.__attributionInitialized) {
            return;
        }
        if (typeof window !== 'undefined') {
            window.__attributionInitialized = true;
        }

        const config = { ...DEFAULT_CONFIG, ...userConfig };

        // SIMPLE: Just capture and store attribution on page load
        debugLog(config, 'Initializing attribution', {
            cookieDomain: config.cookieDomain,
            url: window.location.href,
        });

        try {
            const attribution = captureAttribution(config);
            const result = storeAttribution(attribution, config);

            debugLog(config, 'Attribution initialized', {
                stored: result,
                lastTouch: getCookie(config.lastTouchCookie, config),
            });
        } catch (error) {
            debugError(config, 'Failed to initialize attribution:', error);
        }
    };

    // Debug utility to inspect all cookies
    const debugCookies = (config = DEFAULT_CONFIG) => {
        console.group('[Attribution Debug]');
        console.log('Current URL:', window.location.href);
        console.log('Referrer:', document.referrer);
        console.log('All cookies:', document.cookie);
        console.log('First touch cookie:', getCookie(config.firstTouchCookie, config));
        console.log('Last touch cookie:', getCookie(config.lastTouchCookie, config));

        const url = new URL(window.location.href);
        console.log('URL parameters:', Object.fromEntries(url.searchParams));
        console.log('Detected click ID source:', detectClickIdSource(url.searchParams));
        console.log('Parsed referrer:', parseReferrer(document.referrer, config.cookieDomain));

        const attribution = captureAttribution(config);
        console.log('Current attribution:', attribution);
        console.groupEnd();
    };

    // Export for use
    if (typeof window !== 'undefined') {
        window.__attributionDebug = debugCookies;
        window.initializeAttribution = initializeAttribution;
        window.captureAttribution = captureAttribution;
        window.getStoredAttribution = () => ({
            firstTouch: getCookie(DEFAULT_CONFIG.firstTouchCookie),
            lastTouch: getCookie(DEFAULT_CONFIG.lastTouchCookie),
        });
    }

})();