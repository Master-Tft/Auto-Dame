// Background script for Auto Report Facebook Tool
// By Hacker Nguyễn Tùng Anh

console.log('🔥 Background script loaded - Auto Report Facebook Tool');

// Listen for extension installation
chrome.runtime.onInstalled.addListener(() => {
    console.log('📱 Auto Report Facebook Tool installed successfully');
});

// Listen for messages from content script or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('📨 Message received in background:', request);
    
    // Handle key validation requests (offline - always valid)
    if (request.action === 'validateLicense') {
        const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
        const daysLeft = 365;
        
        sendResponse({
            success: true,
            valid: true,
            tokenData: {
                key: 1,
                type: 'offline',
                expires_at: expiresAt,
                bound_ip: null,
                validated_at: Date.now(),
                days_left: daysLeft,
                is_expired: false,
                status: 'active',
                created_at: null,
                last_used: null,
                usage_count: 0,
                usage_limit: 999999,
                bound_ips_count: 0,
                max_ips: 1
            }
        });
        return; // No async work, close channel immediately
    }
    
    if (request.action === 'log') {
        console.log('📋 Content script log:', request.message);
    }
    
    sendResponse({ success: true });
});

// Keep service worker alive
chrome.runtime.onStartup.addListener(() => {
    console.log('🚀 Extension startup');
});

console.log('✅ Background script initialized');