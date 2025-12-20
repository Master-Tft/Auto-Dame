// Tool Auto Report Facebook - Popup Script
// By Hacker Nguyễn Tùng Anh

console.log('🔥 Tool Auto Report Facebook loaded by Nguyễn Tùng Anh');

document.addEventListener('DOMContentLoaded', function() {
    console.log('📋 DOM loaded, initializing popup...');
    
    const runBtn = document.getElementById('runBtn');
    const dameMode = document.getElementById('dameMode');
    const totalRounds = document.getElementById('totalRounds');
    const celebrityUrl = document.getElementById('celebrityUrl');
    const businessUrl = document.getElementById('businessUrl');
    const verifyBtn = document.getElementById('verifyBtn');
    const licenseKey = document.getElementById('licenseKey');
    const keyStatus = document.getElementById('keyStatus');
    const keyPanel = document.getElementById('keyPanel');
    const reportPanel = document.getElementById('reportPanel');
    const changeKeyBtn = document.getElementById('changeKeyBtn');
    const reportType = document.getElementById('reportType');
    const reportPostBtn = document.getElementById('reportPostBtn');
    const normalDamePanel = document.getElementById('normalDamePanel');
    const damePostPanel = document.getElementById('damePostPanel');
    const fakeConfigSection = document.getElementById('fakeConfigSection');
    
    // API configuration
    const API_BASE_URL = 'http://hethongdvmxh.site/key/api.php';
    
    // Auto check cached key trong 15 phút
    checkCachedKey();
    
    // Event listener cho dropdown chế độ Dame
    dameMode.addEventListener('change', function() {
        const selectedMode = dameMode.value;
        
        if (fakeConfigSection) {
            if (selectedMode === '2' || selectedMode === '3') {
                fakeConfigSection.style.display = 'block';
            } else {
                fakeConfigSection.style.display = 'none';
            }
        }

        if (selectedMode === 'post') {
            // Fade out panel hiện tại
            normalDamePanel.classList.add('panel-fade-out');
            setTimeout(() => {
                normalDamePanel.style.display = 'none';
                normalDamePanel.classList.remove('panel-fade-out');
                damePostPanel.style.display = 'block';
                // Trigger animation
                damePostPanel.style.animation = 'none';
                damePostPanel.offsetHeight; // Trigger reflow
                damePostPanel.style.animation = 'slideInUp 0.5s ease-out';
            }, 300);
        } else {
            // Fade out panel hiện tại
            damePostPanel.classList.add('panel-fade-out');
            setTimeout(() => {
                damePostPanel.style.display = 'none';
                damePostPanel.classList.remove('panel-fade-out');
                normalDamePanel.style.display = 'block';
                // Trigger animation
                normalDamePanel.style.animation = 'none';
                normalDamePanel.offsetHeight; // Trigger reflow
                normalDamePanel.style.animation = 'slideInUp 0.5s ease-out';
            }, 300);
        }
    });
    
    // Event listener cho nút xác thực key
    verifyBtn.addEventListener('click', async function() {
        const keyValue = licenseKey.value.trim();
        
        if (!keyValue) {
            showKeyStatus('❌ Vui lòng nhập License Key!', false);
            return;
        }
        
        // Disable button
        verifyBtn.disabled = true;
        verifyBtn.textContent = '⏳ Đang xác thực...';
        
        try {
            // Use background script to validate key (bypass CSP)
            const response = await chrome.runtime.sendMessage({
                action: 'validateLicense',
                key: keyValue
            });
            
            if (response.success && response.valid) {
                // Key hợp lệ - hiển thị thông tin chi tiết
                const tokenData = response.tokenData;
                const expiryDate = new Date(tokenData.expires_at);
                const validatedDate = new Date(tokenData.validated_at);
                const timeLeft = Math.ceil((expiryDate - Date.now()) / (1000 * 60 * 60 * 24)); // Số ngày còn lại
                
                const keyInfo = `✅ License Key hợp lệ!
🔑 Loại: ${tokenData.type.toUpperCase()}
⏰ Hết hạn: ${expiryDate.toLocaleString('vi-VN')}
📅 Còn lại: ${timeLeft > 0 ? timeLeft + ' ngày' : 'Đã hết hạn'}
🌐 IP Bound: ${tokenData.bound_ip || 'Không giới hạn'}
🕐 Xác thực lúc: ${validatedDate.toLocaleString('vi-VN')}`;
                
                // Lưu thông tin key để hiển thị trong report panel
                window.currentKeyInfo = tokenData;
                
                // Lưu key vào cache
                const cacheData = {
                    key: keyValue,
                    type: tokenData.type,
                    expires_at: tokenData.expires_at,
                    validated_at: Date.now(),
                    cached_at: Date.now()
                };
                localStorage.setItem('autodame_key_cache', JSON.stringify(cacheData));
                console.log('💾 Đã lưu key vào cache');
                
                // Chuyển sang Report Panel với key hợp lệ
                showReportPanelWithValidKey(tokenData);
            } else {
                // Key không hợp lệ
                const message = response.message || response.error || 'Key không hợp lệ!';
                showKeyStatus(`❌ ${message}`, false);
            }
            
        } catch (error) {
            console.error('❌ Key validation error:', error);
            showKeyStatus('❌ Lỗi kết nối extension! Vui lòng thử lại.', false);
        } finally {
            // Reset button
            verifyBtn.disabled = false;
            verifyBtn.textContent = '🔍 Xác thực Key';
        }
    });
    
    // Function check cached key với thời hạn 15 phút
    async function checkCachedKey() {
        try {
            const cachedData = localStorage.getItem('autodame_key_cache');
            if (!cachedData) {
                console.log('🔍 Lần đầu sử dụng - hiển thị panel nhập key');
                showKeyPanel();
                return;
            }
            
            const keyData = JSON.parse(cachedData);
            const now = Date.now();
            const cacheTime = keyData.cached_at || 0;
            const cacheExpiry = 15 * 60 * 1000; // 15 phút
            
            // Kiểm tra cache còn hạn không
            if (now - cacheTime > cacheExpiry) {
                console.log('🕐 Key cache đã hết hạn 15 phút, về panel nhập key');
                localStorage.removeItem('autodame_key_cache');
                showKeyPanel();
                return;
            }
            
            // Cache còn hạn - tự động validate lại
            console.log('✅ Tìm thấy key cache còn hạn, đang validate...');
            licenseKey.value = keyData.key;
            
            // Validate key từ cache
            const response = await chrome.runtime.sendMessage({
                action: 'validateLicense',
                key: keyData.key
            });
            
            if (response.success && response.valid) {
                const tokenData = response.tokenData;
                const expiryDate = new Date(tokenData.expires_at);
                const timeLeft = Math.ceil((expiryDate - Date.now()) / (1000 * 60 * 60 * 24));
                
                console.log('✅ Key cache hợp lệ, vào Report Panel');
                window.currentKeyInfo = tokenData;
                
                // Cập nhật thời gian cache
                keyData.cached_at = now;
                localStorage.setItem('autodame_key_cache', JSON.stringify(keyData));
                
                // Vào Report Panel với key hợp lệ
                showReportPanelWithValidKey(tokenData);
                
            } else {
                console.log('❌ Key cache không hợp lệ/hết hạn, về panel nhập key');
                localStorage.removeItem('autodame_key_cache');
                showKeyPanel();
            }
            
        } catch (error) {
            console.error('❌ Lỗi check cached key:', error);
            localStorage.removeItem('autodame_key_cache');
            showKeyPanel();
        }
    }
    
    // Hiển thị Report Panel với key hợp lệ
    function showReportPanelWithValidKey(tokenData) {
        keyPanel.style.display = 'none';
        reportPanel.style.display = 'block';
        
        // Enable tất cả các nút
        runBtn.disabled = false;
        reportPostBtn.disabled = false;
        dameMode.disabled = false;
        totalRounds.disabled = false;
        reportType.disabled = false;
        
        // Hiển thị thông tin key
        displayKeyInfoInPanel(tokenData);
        
        // Reset về panel Dame thường
        normalDamePanel.style.display = 'block';
        damePostPanel.style.display = 'none';
        dameMode.value = '1';
        if (fakeConfigSection) fakeConfigSection.style.display = 'none';
        
        console.log('✅ Report Panel đã sẵn sàng với key hợp lệ');
    }
    
    // Hiển thị Report Panel với key không hợp lệ/hết hạn
    function showReportPanelWithInvalidKey() {
        keyPanel.style.display = 'none';
        reportPanel.style.display = 'block';
        
        // Disable tất cả các nút
        runBtn.disabled = true;
        reportPostBtn.disabled = true;
        dameMode.disabled = true;
        totalRounds.disabled = true;
        reportType.disabled = true;
        
        // Hiển thị thông báo key hết hạn
        const keyInfoDisplay = document.getElementById('keyInfoDisplay');
        const keyInfoContent = document.getElementById('keyInfoContent');
        
        if (keyInfoDisplay && keyInfoContent) {
            keyInfoContent.innerHTML = `
                <div style="text-align: center; padding: 20px;">
                    <div style="font-size: 48px; margin-bottom: 15px;">🔒</div>
                    <div style="color: #ff6b6b; font-size: 18px; font-weight: bold; margin-bottom: 10px;">
                        KEY HẾT HẠN HOẶC KHÔNG HỢP LỆ
                    </div>
                    <div style="color: #ffffff; font-size: 14px; margin-bottom: 15px;">
                        Vui lòng nhập License Key mới để sử dụng tool
                    </div>
                    <input type="text" id="quickKeyInput" placeholder="Nhập License Key..." style="
                        width: 100%; padding: 12px; border: 2px solid #ff6b6b; 
                        border-radius: 8px; background: #2d2d2d; color: white;
                        font-size: 14px; margin-bottom: 10px;
                    ">
                    <button id="quickVerifyBtn" style="
                        width: 100%; padding: 12px; background: linear-gradient(135deg, #667eea, #764ba2);
                        border: none; border-radius: 8px; color: white; font-weight: bold;
                        cursor: pointer; font-size: 14px;
                    ">🔍 Xác thực Key</button>
                </div>
            `;
            
            // Add event listener cho quick verify
            const quickKeyInput = document.getElementById('quickKeyInput');
            const quickVerifyBtn = document.getElementById('quickVerifyBtn');
            
            quickVerifyBtn.addEventListener('click', async () => {
                const keyValue = quickKeyInput.value.trim();
                if (!keyValue) {
                    alert('❌ Vui lòng nhập License Key!');
                    return;
                }
                
                quickVerifyBtn.disabled = true;
                quickVerifyBtn.textContent = '⏳ Đang xác thực...';
                
                try {
                    const response = await chrome.runtime.sendMessage({
                        action: 'validateLicense',
                        key: keyValue
                    });
                    
                    if (response.success && response.valid) {
                        const tokenData = response.tokenData;
                        
                        // Lưu vào cache
                        const cacheData = {
                            key: keyValue,
                            type: tokenData.type,
                            expires_at: tokenData.expires_at,
                            validated_at: Date.now(),
                            cached_at: Date.now()
                        };
                        localStorage.setItem('autodame_key_cache', JSON.stringify(cacheData));
                        
                        // Chuyển sang trạng thái valid
                        window.currentKeyInfo = tokenData;
                        showReportPanelWithValidKey(tokenData);
                        
                    } else {
                        alert('❌ ' + (response.message || 'Key không hợp lệ!'));
                    }
                } catch (error) {
                    alert('❌ Lỗi kết nối: ' + error.message);
                } finally {
                    quickVerifyBtn.disabled = false;
                    quickVerifyBtn.textContent = '🔍 Xác thực Key';
                }
            });
        }
        
        // Reset về panel Dame thường
        normalDamePanel.style.display = 'block';
        damePostPanel.style.display = 'none';
        dameMode.value = '1';
        
        console.log('⚠️ Report Panel hiển thị với trạng thái cần xác thực key');
    }
    
    function showKeyStatus(message, isValid) {
        keyStatus.textContent = message;
        keyStatus.className = `key-status ${isValid ? 'key-valid' : 'key-invalid'}`;
        keyStatus.style.display = 'block';
        
        if (isValid) {
            // Delay để người dùng thấy thông báo thành công
            setTimeout(() => {
                showReportPanel();
            }, 1500);
        }
    }
    
    function showReportPanel() {
        keyPanel.style.display = 'none';
        reportPanel.style.display = 'block';
        
        // Hiển thị thông tin key chi tiết trong report panel
        if (window.currentKeyInfo) {
            displayKeyInfoInPanel(window.currentKeyInfo);
        }
        
        // Reset về panel Dame Not (chế độ 1) khi mở report panel
        normalDamePanel.style.display = 'block';
        damePostPanel.style.display = 'none';
        dameMode.value = '1'; // Reset về Dame Not
        if (fakeConfigSection) fakeConfigSection.style.display = 'none';
    }
    
    function displayKeyInfoInPanel(tokenData) {
        const keyInfoDisplay = document.getElementById('keyInfoDisplay');
        const keyInfoContent = document.getElementById('keyInfoContent');
        
        if (keyInfoDisplay && keyInfoContent && tokenData) {
            const expiryDate = new Date(tokenData.expires_at);
            const validatedDate = new Date(tokenData.validated_at);
            const timeLeft = Math.ceil((expiryDate - Date.now()) / (1000 * 60 * 60 * 24));
            
            // Tạo màu sắc dựa trên thời gian còn lại
            let timeColor = '#4caf50'; // Xanh lá sáng
            if (timeLeft <= 7) timeColor = '#ff9800'; // Cam sáng
            if (timeLeft <= 3) timeColor = '#f44336'; // Đỏ sáng
            if (timeLeft <= 1) timeColor = '#e91e63'; // Hồng đỏ
            
            // Tạo status badge
            let statusBadge = '';
            let statusColor = '#4caf50';
            if (tokenData.status === 'expired') {
                statusBadge = '❌ HẾT HẠN';
                statusColor = '#f44336';
            } else if (tokenData.status === 'expiring_soon') {
                statusBadge = '⚠️ SẮP HẾT HẠN';
                statusColor = '#ff9800';
            } else {
                statusBadge = '✅ HOẠT ĐỘNG';
                statusColor = '#4caf50';
            }
            
            keyInfoContent.innerHTML = `
                <div style="display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 12px;">
                    <div style="flex: 1; min-width: 140px;">
                        <strong style="color: #ffffff; font-size: 14px;">🔑 Loại Key:</strong><br>
                        <span style="color: #00ff88; text-transform: uppercase; font-weight: bold; font-size: 16px;">${tokenData.type}</span>
                    </div>
                    <div style="flex: 1; min-width: 140px;">
                        <strong style="color: #ffffff; font-size: 14px;">📊 Trạng thái:</strong><br>
                        <span style="color: ${statusColor}; font-weight: bold; font-size: 16px;">${statusBadge}</span>
                    </div>
                </div>
                <div style="display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 12px;">
                    <div style="flex: 1; min-width: 140px;">
                        <strong style="color: #ffffff; font-size: 14px;">⏰ Hết hạn:</strong><br>
                        <span style="color: #ffeb3b; font-weight: bold; font-size: 15px;">${expiryDate.toLocaleDateString('vi-VN')}</span><br>
                        <small style="color: #ffffff; opacity: 0.8; font-size: 13px;">${expiryDate.toLocaleTimeString('vi-VN')}</small>
                    </div>
                    <div style="flex: 1; min-width: 140px;">
                        <strong style="color: #ffffff; font-size: 14px;">📅 Còn lại:</strong><br>
                        <span style="color: ${timeColor}; font-weight: bold; font-size: 17px; text-shadow: 0 0 5px ${timeColor};">${timeLeft > 0 ? timeLeft + ' ngày' : 'Đã hết hạn'}</span>
                    </div>
                </div>
                <div style="display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 12px;">
                    <div style="flex: 1; min-width: 140px;">
                        <strong style="color: #ffffff; font-size: 14px;">🌐 IP Bound:</strong><br>
                        ${tokenData.type === 'vip' && tokenData.bound_ips_count !== undefined ? `
                            <span style="color: #ff9800; font-weight: bold; font-size: 15px;">${tokenData.bound_ips_count}/${tokenData.max_ips == 999 ? '∞' : tokenData.max_ips} IP</span>
                        ` : `
                            <span style="color: #ff9800; font-weight: bold; font-size: 15px;">${tokenData.bound_ip || 'Chưa bind'}</span>
                        `}
                    </div>
                    ${tokenData.usage_count !== undefined ? `
                    <div style="flex: 1; min-width: 140px;">
                        <strong style="color: #ffffff; font-size: 14px;">📈 Lượt sử dụng:</strong><br>
                        <span style="color: #2196f3; font-weight: bold; font-size: 15px;">${tokenData.usage_count}${tokenData.usage_limit && tokenData.usage_limit != 999999 ? '/' + tokenData.usage_limit : '/∞'}</span>
                    </div>
                    ` : ''}
                </div>
                <div style="margin-top: 12px; padding-top: 12px; border-top: 2px solid rgba(255,255,255,0.2); font-size: 13px;">
                    <div style="display: flex; justify-content: space-between; flex-wrap: wrap; gap: 12px;">
                        <div>
                            <strong style="color: #ffffff;">🕐 Xác thực:</strong><br>
                            <span style="color: #4caf50; font-weight: bold;">${validatedDate.toLocaleString('vi-VN')}</span>
                        </div>
                        ${tokenData.last_used ? `
                        <div>
                            <strong style="color: #ffffff;">🕒 Sử dụng cuối:</strong><br>
                            <span style="color: #ff5722; font-weight: bold;">${new Date(tokenData.last_used).toLocaleString('vi-VN')}</span>
                        </div>
                        ` : ''}
                    </div>
                </div>
            `;
            
            // Không cần ẩn/hiện nữa vì đã hiển thị luôn
        }
    }
    
    function showKeyPanel() {
        keyPanel.style.display = 'block';
        reportPanel.style.display = 'none';
        keyStatus.style.display = 'none';
        licenseKey.value = '';
    }
    
    // Bỏ nút đổi key - không cần nữa vì có quick input trong Report Panel
    
    // Event listener cho nút Report Post
    reportPostBtn.addEventListener('click', async function() {
        console.log('🚨 Report Post button clicked');
        
        const selectedType = reportType.value;
        
        // Disable button
        reportPostBtn.disabled = true;
        reportPostBtn.textContent = '⏳ Đang khởi động...';
        
        try {
            // Lấy tab hiện tại
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            if (!tab.url.includes('facebook.com')) {
                alert('❌ Vui lòng mở Facebook trước khi chạy script!');
                return;
            }
            
            console.log('📍 Current tab:', tab.url);
            console.log('📋 Report type:', selectedType);
            
            // Bỏ check token - chạy luôn

            // Inject và chạy script sử dụng function từ content.js
            await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: function(reportType) {
                    // Force inject content script nếu chưa có
                    if (typeof window.advancedReportPost !== 'function') {
                        console.log('⚠️ Content script chưa load, đang inject...');
                        
                        // Inject toàn bộ content script
                        const contentScript = document.createElement('script');
                        contentScript.src = chrome.runtime.getURL('content.js');
                        contentScript.onload = function() {
                            console.log('✅ Content script loaded for Report Post');
                            // Chờ 1 giây để đảm bảo script được parse
                            setTimeout(() => {
                                if (typeof window.advancedReportPost === 'function') {
                                    window.advancedReportPost(reportType);
                                } else {
                                    // Fallback: alert user to refresh
                                    console.log('🔄 Content script function not available');
                                    alert('⚠️ Vui lòng refresh trang Facebook và thử lại!');
                                }
                            }, 1000);
                        };
                        contentScript.onerror = function() {
                            console.error('❌ Failed to load content script');
                            alert('❌ Lỗi: Không thể load content script. Vui lòng refresh trang!');
                        };
                        document.head.appendChild(contentScript);
                    } else {
                        // Sử dụng function từ content script
                        window.advancedReportPost(reportType);
                    }
                },
                args: [selectedType]
            });
            
            // Thông báo thành công
            reportPostBtn.textContent = '✅ Đã khởi động!';
            reportPostBtn.style.background = 'linear-gradient(135deg, #00b894, #00a085)';
            
            // Show success message
            showReportSuccessMessage(selectedType);
            
            // Reset button sau 3 giây
            setTimeout(() => {
                reportPostBtn.disabled = false;
                reportPostBtn.textContent = '🚨 Report Post';
                reportPostBtn.style.background = 'linear-gradient(135deg, #e17055, #d63031)';
            }, 3000);
            
        } catch (error) {
            console.error('❌ Error:', error);
            alert('❌ Lỗi khi chạy script: ' + error.message);
            
            // Reset button
            reportPostBtn.disabled = false;
            reportPostBtn.textContent = '🚨 Report Post';
        }
    });
    
    // Event listener cho nút chạy
    runBtn.addEventListener('click', async function() {
        console.log('🚀 Run button clicked');
        
        const mode = parseInt(dameMode.value);
        const rounds = parseInt(totalRounds.value);
        
        // Validate input
        if (isNaN(rounds) || rounds < 1 || rounds > 999999999) {
            alert('❌ Số vòng phải từ 1 đến 999999999!');
            return;
        }
        
        // Disable button
        runBtn.disabled = true;
        runBtn.textContent = '⏳ Đang khởi động...';
        
        try {
            // Lấy tab hiện tại
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            if (!tab.url.includes('facebook.com')) {
                alert('❌ Vui lòng mở Facebook trước khi chạy script!');
                return;
            }
            
            console.log('📍 Current tab:', tab.url);
            
            // Get current key từ input
            const currentKey = licenseKey.value.trim();
            if (!currentKey) {
                alert('❌ Vui lòng nhập License Key trước khi chạy!');
                return;
            }
            
            // Đảm bảo content script được inject trước - force inject
            await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                files: ['content.js']
            });
            console.log('✅ Content script force injected');
            
            // Chờ 1 giây để content script load xong
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Inject và chạy script Dame (Not/Profile)
            await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: runAutoDame,
                args: [mode, rounds, currentKey, celebrityUrl ? celebrityUrl.value.trim() : '', businessUrl ? businessUrl.value.trim() : '']
            });
            
            // Thông báo thành công
            runBtn.textContent = '✅ Đã khởi động!';
            runBtn.style.background = 'linear-gradient(135deg, #00b894, #00a085)';
            
            // Show success message
            showSuccessMessage(mode, rounds);
            
            // Reset button sau 3 giây
            setTimeout(() => {
                runBtn.disabled = false;
                runBtn.textContent = '🚀 Bắt đầu Dame ngay!';
                runBtn.style.background = 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)';
            }, 3000);
            
        } catch (error) {
            console.error('❌ Error:', error);
            alert('❌ Lỗi khi chạy script: ' + error.message);
            
            // Reset button
            runBtn.disabled = false;
            runBtn.textContent = '🚀 Bắt đầu Dame ngay!';
        }
    });
    
    // Function để inject vào Facebook page
    function runAutoDame(mode, rounds, currentKey, celebrityUrl, businessUrl) {
        console.log('🎯 Starting AutoDame with mode:', mode, 'rounds:', rounds);
        console.log('🔑 Using key:', currentKey);
        
        if (!currentKey || currentKey === '') {
            alert('❌ Vui lòng nhập License Key trước khi chạy!');
            return;
        }
        
        // Tạo token đơn giản với key hiện tại
        const validatedToken = {
            key: currentKey,
            type: 'premium',
            expires_at: new Date(Date.now() + 24*60*60*1000).toISOString(), // 24h từ bây giờ
            validated_at: Date.now(),
            fakeCelebrityUrl: celebrityUrl || '',
            fakeBusinessUrl: businessUrl || ''
        };
        
        // Gọi trực tiếp startAutoReport - content script đã được inject
        console.log('🚀 Calling startAutoReport directly...');
        
        if (window.startAutoReport) {
            window.startAutoReport(validatedToken, mode, rounds);
        } else {
            console.log('⚠️ startAutoReport not found, trying alternative...');
            // Fallback: gọi quickStart nếu có
            if (window.quickStart) {
                window.quickStart(mode, rounds);
            } else {
                console.log('❌ No available functions found');
            }
        }
    }
    
    function showSuccessMessage(mode, rounds) {
        const modeNames = {
            1: '🏢 Dame Not',
            2: '👤 Dame Profile'
        };
        
        const message = `
            🎉 AutoDame Pro đã khởi động thành công!
            
            📋 Thông tin:
            • Chế độ: ${modeNames[mode]}
            • Số vòng: ${rounds}
            • Trạng thái: Đang chạy...
            
            💡 Kiểm tra console và popup log trên Facebook để theo dõi tiến trình!
        `;
        
        alert(message);
    }
    
    function showReportSuccessMessage(reportType) {
        const reportNames = {
            scam: '💰 Scam, fraud or false information',
            bullying: '😡 Bullying, harassment or abuse',
            spam: '📧 Spam'
        };
        
        const message = `
            🚨 Report Post đã khởi động thành công!
            
            📋 Thông tin:
            • Loại báo cáo: ${reportNames[reportType]}
            • Trạng thái: Đang chạy...
            
            💡 Script sẽ tự động báo cáo tất cả bài viết có nút Actions!
        `;
        
        alert(message);
    }
    
    // Function để inject Report Post script
    function runReportPost(reportType) {
        console.log('🚨 Starting Report Post with type:', reportType);
        
        // Get key từ input hiện tại thay vì localStorage
        const currentKey = licenseKey.value.trim();
        
        if (!currentKey) {
            alert('❌ Vui lòng nhập License Key trước khi chạy!');
            return;
        }
        
        // Tạo token đơn giản với key hiện tại
        const validatedToken = {
            key: currentKey,
            type: 'premium',
            expires_at: new Date(Date.now() + 24*60*60*1000).toISOString(), // 24h từ bây giờ
            validated_at: Date.now()
        };
        
        // Inject script trực tiếp với report type
        const script = document.createElement('script');
        script.textContent = `
            console.log('🚨 Report Post script injected successfully');
            console.log('🔑 Using validated token for key: ${currentKey}');
            console.log('📋 Report type: ${reportType}');
            
            // Create validated token object
            const validatedToken = ${JSON.stringify(validatedToken)};
            
            // Inject Report Post script từ file 1.txt
            ${getReportPostScript(reportType)}
        `;
        document.head.appendChild(script);
    }
    
    // Function để lấy script từ 1.txt với report type tương ứng
    function getReportPostScript(reportType) {
        const reportFlows = {
            scam: {
                step1: 'Scam, fraud or false information',
                step2: 'Fraud or scam'
            },
            bullying: {
                step1: 'Bullying, harassment or abuse', 
                step2: 'Bullying or harassment'
            },
            spam: {
                step1: 'Scam, fraud or false information',
                step2: 'Spam'
            }
        };
        
        const flow = reportFlows[reportType];
        
        return `(async () => {
          const wait = ms => new Promise(r => setTimeout(r, ms));
          let reportCount = 0;
          
          const clickByText = async (text, maxRetries = 100000, delay = 300) => {
            console.log('🔹 Tìm và click: ' + text);
            let el;
            for (let i = 0; i < maxRetries; i++) {
              const elements = document.querySelectorAll('span, div[role="menuitem"] span, div[role="button"] span');
              el = Array.from(elements).find(e => e.textContent.trim() === text);
              if (el && el.offsetParent !== null) break;
              await wait(0);
            }
            if (!el) return false;
            
            el.scrollIntoView({ block: "center", inline: "center" });
            const rect = el.getBoundingClientRect();
            const x = rect.left + rect.width / 2;
            const y = rect.top + rect.height / 2;
            const fire = type => {
              el.dispatchEvent(new MouseEvent(type, {
                bubbles: true,
                cancelable: true,
                view: window,
                clientX: x,
                clientY: y,
                button: 0
              }));
            };
            ["mouseover", "mousedown", "mouseup", "click"].forEach(fire);
            console.log('✅ Đã click: ' + text);
            return true;
          };
          
          const clickSubmit = async () => {
            console.log('🔹 Tìm nút Submit...');
            let submitBtn;
            for (let i = 0; i < 12; i++) {
              const spans = document.querySelectorAll('div[role="none"] span');
              submitBtn = Array.from(spans).find(span => span.textContent.trim() === 'Submit');
              if (submitBtn && submitBtn.offsetParent !== null) break;
              await wait(150);
            }
            if (!submitBtn) return false;
            
            submitBtn.click();
            console.log('✅ Đã click Submit');
            await wait(900);
            return true;
          };
          
          const clickBlockAndUnfollow = async () => {
            console.log('🔹 Tìm Unfollow (bỏ qua Block)...');
            
            const unfollowElements = document.querySelectorAll('span');
            const unfollowEl = Array.from(unfollowElements).find(e => e.textContent.trim() === 'Unfollow');
            if (unfollowEl && unfollowEl.offsetParent !== null) {
              unfollowEl.click();
              console.log('✅ Đã click Unfollow');
              await wait(500);
            }
          };
          
          const findActionsButton = async () => {
            const label = "Actions for this post";
            const selector = '[aria-label="' + label + '"]';
            let el;
            for (let i = 0; i < 10; i++) {
              el = document.querySelector(selector);
              if (el && el.offsetParent !== null) break;
              await wait(220);
            }
            return el;
          };
          
          const performOneReport = async () => {
            console.log('🚀 Bắt đầu báo cáo lần ' + (reportCount + 1));
            
            const actionsBtn = await findActionsButton();
            if (!actionsBtn) {
              console.log('❌ Không tìm thấy nút Actions for this post');
              return false;
            }
            
            actionsBtn.scrollIntoView({ block: "center", inline: "center" });
            const rect = actionsBtn.getBoundingClientRect();
            const x = rect.left + rect.width / 2;
            const y = rect.top + rect.height / 2;
            const fire = type => {
              actionsBtn.dispatchEvent(new MouseEvent(type, {
                bubbles: true,
                cancelable: true,
                view: window,
                clientX: x,
                clientY: y,
                button: 0
              }));
            };
            ["mouseover", "mousedown", "mouseup", "click"].forEach(fire);
            console.log("✅ Đã click Actions for this post");
            await wait(900);
            
            if (!(await clickByText('Report post'))) return false;
            if (!(await clickByText('${flow.step1}'))) return false;
            if (!(await clickByText('${flow.step2}'))) return false;
            
            if ('${reportType}' !== 'spam') {
              if (!(await clickSubmit())) return false;
              if (!(await clickByText('Next'))) return false;
              await clickBlockAndUnfollow();
            }
            
            // Done: thử click nhưng không coi là lỗi nếu không tìm thấy (non-blocking)
            await clickByText('Done', 200, 0);
            
            reportCount++;
            console.log('🎉 Hoàn thành báo cáo lần ' + reportCount);
            return true;
          };
          
          console.log('🚀 Bắt đầu Auto Report Loop - ${reportType.toUpperCase()} Flow');
          
          while (true) {
            const actionsBtn = await findActionsButton();
            if (!actionsBtn) {
              console.log('🏁 Không còn nút Actions for this post. Đã hoàn thành ' + reportCount + ' báo cáo!');
              break;
            }
            
            const success = await performOneReport();
            if (!success) {
              console.log('❌ Báo cáo thất bại, dừng lại');
              break;
            }
          }
          
          console.log('🎉 Hoàn tất! Tổng cộng đã báo cáo ' + reportCount + ' lần.');
        })();`;
    }
    
    console.log('✅ Popup initialized successfully');
});

// Log thông tin extension
console.log(`
🚀 AutoDame Pro - Advanced Version
👨‍💻 Developed by: AutoDame Team
🎯 Features: Professional Facebook Report Bot
📅 Version: 2.0.0
`);