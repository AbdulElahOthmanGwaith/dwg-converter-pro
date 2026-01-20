/*
    DWG Converter Pro v2.0 - Main JavaScript
    سكريبت المنصة الهندسية الذكية
*/

// ===================================
// المتغيرات العامة
// ===================================
let files = [];
let currentFile = null;
let userSession = null;
let isDarkMode = false;
let currentLang = 'ar';

// تهيئة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    initApp();
    initAnimations();
    loadUserSession();
});

function initApp() {
    // تهيئة شاشة التحميل
    setTimeout(() => {
        document.getElementById('loadingScreen').classList.add('hidden');
    }, 1500);

    // تهيئة شريط التنقل
    initNavbar();
    
    // تهيئة رفع الملفات
    initFileUpload();
    
    // تهيئة التحويل
    initConversion();
    
    // تهيئة الإعدادات
    initSettings();
    
    // تهيئة أدوات الذكاء الاصطناعي
    initAITools();
    
    // تهيئة المشاريع
    initProjects();
    
    // تهيئة GitLab
    initGitLab();
    
    // تهيئة تسجيل الدخول
    initLoginSystem();
    
    // تهيئة الوضع الداكن
    initTheme();
    
    // تخصيص المظهر
    initCustomization();
}

// ===================================
// تهيئة الأنيميشن والإحصائيات
// ===================================
function initAnimations() {
    // إحصائيات متحركة
    const stats = document.querySelectorAll('.stat-number');
    stats.forEach(stat => {
        const target = parseInt(stat.dataset.count);
        animateNumber(stat, target);
    });

    // تأثير الظهور عند التمرير
    const revealElements = document.querySelectorAll('.feature-card, .section-header, .converter-container');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, { threshold: 0.1 });

    revealElements.forEach(el => {
        el.classList.add('reveal');
        observer.observe(el);
    });
}

function animateNumber(element, target) {
    let current = 0;
    const increment = target / 50;
    const duration = 2000;
    const stepTime = duration / 50;

    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        element.textContent = formatNumber(Math.floor(current));
    }, stepTime);
}

function formatNumber(num) {
    return num.toLocaleString('ar-EG');
}

// ===================================
// تهيئة شريط التنقل
// ===================================
function initNavbar() {
    const navbar = document.getElementById('navbar');
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobileMenu');

    // تغيير الشريط عند التمرير
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // إظهار زر العودة للأعلى
            const backToTop = document.getElementById('backToTop');
        if (window.scrollY > 500) {
            backToTop.classList.add('active');
        } else {
            backToTop.classList.remove('active');
        }
    });

    // القائمة الجانبية للجوال
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        mobileMenu.classList.toggle('active');
        document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
    });

    // روابط التنقل النشطة
    const sections = document.querySelectorAll('section[id]');
    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            if (window.scrollY >= sectionTop) {
                current = section.getAttribute('id');
            }
        });

        document.querySelectorAll('.nav-links a').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });

    // العودة للأعلى
    document.getElementById('backToTop').addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// ===================================
// تهيئة رفع الملفات
// ===================================
function initFileUpload() {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');

    // النقر لاختيار الملفات
    dropZone.addEventListener('click', () => fileInput.click());

    // تغيير الملف المحدد
    fileInput.addEventListener('change', (e) => {
        handleFiles(e.target.files);
    });

    // السحب والإفلات
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => {
            dropZone.classList.add('drag-over');
        });
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => {
            dropZone.classList.remove('drag-over');
        });
    });

    dropZone.addEventListener('drop', (e) => {
        const files = e.dataTransfer.files;
        handleFiles(files);
    });

    // زر التحويل
    document.getElementById('convertBtn').addEventListener('click', startConversion);
    document.getElementById('clearBtn').addEventListener('click', clearAllFiles);
}

function handleFiles(fileList) {
    const validFiles = Array.from(fileList).filter(file => {
        const validExtensions = ['.dwg', '.dxf', '.dwt', '.dws'];
        return validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
    });

    if (validFiles.length === 0) {
        showNotification('يرجى اختيار ملفات DWG أو DXF صالحة', 'error');
        return;
    }

    validFiles.forEach(file => {
        const fileData = {
            id: Date.now() + Math.random(),
            name: file.name,
            size: file.size,
            type: file.type,
            file: file,
            status: 'pending',
            progress: 0
        };
        files.push(fileData);
    });

    updateFilesList();
    updateConvertButton();
    updateBatchSection();
    
    document.getElementById('filesList').style.display = 'block';
}

function updateFilesList() {
    const container = document.getElementById('filesContainer');
    container.innerHTML = files.map(file => `
        <div class="file-card" data-id="${file.id}">
            <div class="file-icon">
                <i class="fas fa-file-cad"></i>
            </div>
            <div class="file-info">
                <h4>${file.name}</h4>
                <p>${formatFileSize(file.size)} • ${file.status === 'pending' ? 'في الانتظار' : file.status}</p>
            </div>
            <div class="file-actions">
                <button class="btn-action" onclick="viewFile('${file.id}')" title="معاينة">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn-action" onclick="removeFile('${file.id}')" title="إزالة">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            ${file.status === 'processing' ? `
                <div class="file-progress">
                    <div class="progress-bar" style="width: ${file.progress}%"></div>
                </div>
            ` : ''}
        </div>
    `).join('');
}

function updateConvertButton() {
    const convertBtn = document.getElementById('convertBtn');
    convertBtn.disabled = files.length === 0;
}

function updateBatchSection() {
    const batchSection = document.getElementById('batchSection');
    batchSection.style.display = files.length > 0 ? 'block' : 'none';
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function removeFile(id) {
    files = files.filter(f => f.id != id);
    updateFilesList();
    updateConvertButton();
    updateBatchSection();
    
    if (files.length === 0) {
        document.getElementById('filesList').style.display = 'none';
    }
}

function clearAllFiles() {
    files = [];
    updateFilesList();
    updateConvertButton();
    updateBatchSection();
    document.getElementById('filesList').style.display = 'none';
}

function viewFile(id) {
    const file = files.find(f => f.id == id);
    if (file) {
        showDWGViewer(file);
    }
}

// ===================================
// تهيئة التحويل
// ===================================
function initConversion() {
    // تحديث خيارات التحويل
    document.querySelectorAll('.option-group select').forEach(select => {
        select.addEventListener('change', saveConversionSettings);
    });

    document.querySelectorAll('.checkbox-item input').forEach(checkbox => {
        checkbox.addEventListener('change', saveConversionSettings);
    });

    // تحميل الإعدادات المحفوظة
    loadConversionSettings();

    // التحويل الجماعي
    document.getElementById('batchConvertBtn').addEventListener('click', startBatchConversion);
    
    // تحميل مصدر المشروع
    document.getElementById('downloadSourceBtn').addEventListener('click', downloadSource);
    
    // تحميل الكل
    document.getElementById('downloadAllBtn').addEventListener('click', downloadAllFiles);
}

function startConversion() {
    const outputFormat = document.getElementById('outputFormat').value;
    const aiClean = document.getElementById('aiClean').checked;
    
    files.forEach(file => {
        if (file.status === 'pending') {
            simulateConversion(file, outputFormat, aiClean);
        }
    });
}

function simulateConversion(file, format, aiClean) {
    file.status = 'processing';
    file.progress = 0;
    updateFilesList();
    updateConvertButton();

    const progressInterval = setInterval(() => {
        file.progress += Math.random() * 15;
        
        if (file.progress >= 100) {
            file.progress = 100;
            file.status = 'completed';
            clearInterval(progressInterval);
            
            updateFilesList();
            updateConvertButton();
            
            // محاكاة الذكاء الاصطناعي
            if (aiClean) {
                setTimeout(() => {
                    showNotification(`تم تنظيف "${file.name}" بنجاح بالذكاء الاصطناعي`, 'success');
                }, 500);
            }
            
            showNotification(`تم تحويل "${file.name}" بنجاح`, 'success');
        } else {
            updateFilesList();
        }
    }, 300);
}

function startBatchConversion() {
    const selectedFormats = Array.from(document.querySelectorAll('.batch-target input:checked'))
        .map(checkbox => checkbox.value);

    if (selectedFormats.length === 0) {
        showNotification('يرجى اختيار صيغة واحدة على الأقل', 'error');
        return;
    }

    files.forEach(file => {
        selectedFormats.forEach(format => {
            const fileData = {
                id: Date.now() + Math.random(),
                name: file.name.replace(/\.[^/.]+$/, '') + `_${format}.${format}`,
                size: file.size,
                type: format,
                status: 'processing',
                progress: 0,
                originalFile: file
            };
            
            simulateBatchConversion(fileData);
        });
    });
}

function simulateBatchConversion(file) {
    const progressInterval = setInterval(() => {
        file.progress += Math.random() * 10;
        
        if (file.progress >= 100) {
            file.progress = 100;
            file.status = 'completed';
            clearInterval(progressInterval);
        }
    }, 200);
}

function saveConversionSettings() {
    const settings = {
        outputFormat: document.getElementById('outputFormat').value,
        dwgVersion: document.getElementById('dwgVersion').value,
        imageResolution: document.getElementById('imageResolution').value,
        backgroundColor: document.getElementById('backgroundColor').value,
        includeLayers: document.getElementById('includeLayers').checked,
        flattenLayers: document.getElementById('flattenLayers').checked,
        embedFonts: document.getElementById('embedFonts').checked,
        aiClean: document.getElementById('aiClean').checked
    };
    
    localStorage.setItem('conversionSettings', JSON.stringify(settings));
}

function loadConversionSettings() {
    const settings = JSON.parse(localStorage.getItem('conversionSettings'));
    
    if (settings) {
        Object.keys(settings).forEach(key => {
            const element = document.getElementById(key);
            if (element) {
                if (element.type === 'checkbox') {
                    element.checked = settings[key];
                } else {
                    element.value = settings[key];
                }
            }
        });
    }
}

// ===================================
// تحميل الملفات
// ===================================
function downloadAllFiles() {
    const completedFiles = files.filter(f => f.status === 'completed');
    
    if (completedFiles.length === 0) {
        showNotification('لا توجد ملفات مكتملة للتحميل', 'error');
        return;
    }
    
    showNotification('جاري تحضير الملفات للتحميل...', 'info');
    
    // محاكاة التحميل
    setTimeout(() => {
        completedFiles.forEach(file => {
            createDownloadLink(file);
        });
        showNotification(`تم تحميل ${completedFiles.length} ملف بنجاح`, 'success');
    }, 1000);
}

function createDownloadLink(file) {
    const link = document.createElement('a');
    link.href = '#';
    link.download = file.name;
    link.click();
}

function downloadSource() {
    // إنشاء ملف ZIP للمشروع
    const projectData = {
        name: 'DWG Converter Pro Project',
        created: new Date().toISOString(),
        files: files.map(f => ({
            name: f.name,
            size: f.size,
            status: f.status
        }))
    };
    
    // إنشاء ملف JSON
    const dataStr = JSON.stringify(projectData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'project_source.json';
    link.click();
    
    showNotification('تم تحميل معلومات المشروع', 'success');
}

// ===================================
// عارض DWG
// ===================================
function showDWGViewer(file) {
    // إنشاء نافذة العارض
    const viewerModal = document.createElement('div');
    viewerModal.className = 'dwg-viewer-modal active';
    viewerModal.innerHTML = `
        <div class="dwg-viewer-content">
            <div class="dwg-viewer-header">
                <h3><i class="fas fa-eye"></i> ${file.name}</h3>
                <div class="dwg-viewer-actions">
                    <button class="btn-icon" title="تكبير"><i class="fas fa-search-plus"></i></button>
                    <button class="btn-icon" title="تصغير"><i class="fas fa-search-minus"></i></button>
                    <button class="btn-icon" title="إعادة تعيين"><i class="fas fa-compress"></i></button>
                    <button class="modal-close" onclick="closeDWGViewer()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
            <div class="dwg-viewer-body">
                <div class="dwg-layers-panel">
                    <h4><i class="fas fa-layer-group"></i> الطبقات</h4>
                    <div class="layers-list">
                        <div class="layer-item active">
                            <input type="checkbox" checked>
                            <span>0</span>
                        </div>
                        <div class="layer-item active">
                            <input type="checkbox" checked>
                            <span>Defpoints</span>
                        </div>
                        <div class="layer-item active">
                            <input type="checkbox" checked>
                            <span>Walls</span>
                        </div>
                        <div class="layer-item active">
                            <input type="checkbox" checked>
                            <span>Doors</span>
                        </div>
                        <div class="layer-item">
                            <input type="checkbox" checked>
                            <span>Windows</span>
                        </div>
                        <div class="layer-item active">
                            <input type="checkbox" checked>
                            <span>Dimensions</span>
                        </div>
                    </div>
                </div>
                <div class="dwg-canvas-container">
                    <div class="dwg-canvas" id="dwgCanvas">
                        <svg viewBox="0 0 800 600" width="100%" height="100%">
                            <rect width="800" height="600" fill="#2d2d2d"/>
                            <rect x="100" y="100" width="600" height="400" fill="none" stroke="#667eea" stroke-width="2"/>
                            <rect x="150" y="150" width="200" height="150" fill="none" stroke="#10b981" stroke-width="2"/>
                            <rect x="450" y="150" width="200" height="300" fill="none" stroke="#f093fb" stroke-width="2"/>
                            <rect x="200" y="350" width="80" height="100" fill="none" stroke="#fc605c" stroke-width="2"/>
                            <text x="400" y="50" fill="#667eea" font-size="24" text-anchor="middle" font-family="Cairo">${file.name}</text>
                            <text x="400" y="550" fill="#718096" font-size="14" text-anchor="middle" font-family="Cairo">عارض DWG - ${formatFileSize(file.size)}</text>
                        </svg>
                    </div>
                </div>
                <div class="dwg-properties-panel">
                    <h4><i class="fas fa-info-circle"></i> المعلومات</h4>
                    <div class="property-item">
                        <span class="prop-label">اسم الملف</span>
                        <span class="prop-value">${file.name}</span>
                    </div>
                    <div class="property-item">
                        <span class="prop-label">الحجم</span>
                        <span class="prop-value">${formatFileSize(file.size)}</span>
                    </div>
                    <div class="property-item">
                        <span class="prop-label">الطبقات</span>
                        <span class="prop-value">6</span>
                    </div>
                    <div class="property-item">
                        <span class="prop-label">الهندسة</span>
                        <span class="prop-value">3D</span>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(viewerModal);
    document.body.style.overflow = 'hidden';
}

function closeDWGViewer() {
    const viewerModal = document.querySelector('.dwg-viewer-modal');
    if (viewerModal) {
        viewerModal.remove();
        document.body.style.overflow = '';
    }
}

// ===================================
// تهيئة أدوات الذكاء الاصطناعي
// ===================================
function initAITools() {
    // تغيير الأدوات
    document.querySelectorAll('.ai-tool').forEach(tool => {
        tool.addEventListener('click', () => {
            const toolName = tool.dataset.tool;
            switchAITool(toolName);
        });
    });

    // منظف الطبقات
    document.getElementById('startCleanBtn').addEventListener('click', startAIClean);
    
    // تقدير الكميات
    document.getElementById('startEstimateBtn').addEventListener('click', startEstimation);
    
    // تحليل المخطط
    document.getElementById('startAnalyzeBtn').addEventListener('click', startAnalysis);
    
    // المساعد المحادثي
    document.getElementById('sendMessageBtn').addEventListener('click', sendChatMessage);
    document.getElementById('chatInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendChatMessage();
    });
}

function switchAITool(toolName) {
    // تحديث الأداة النشطة
    document.querySelectorAll('.ai-tool').forEach(t => t.classList.remove('active'));
    document.querySelector(`[data-tool="${toolName}"]`).classList.add('active');
    
    // تحديث اللوحة
    document.querySelectorAll('.ai-tool-panel').forEach(p => p.classList.remove('active'));
    document.getElementById(`${toolName}Panel`).classList.add('active');
}

function startAIClean() {
    const options = {
        mergeLayers: document.getElementById('mergeLayers').checked,
        removeDuplicates: document.getElementById('removeDuplicates').checked,
        fixLayerNames: document.getElementById('fixLayerNames').checked,
        removeZeroLength: document.getElementById('removeZeroLength').checked
    };
    
    showNotification('جاري تحليل وتنظيف الملف بالذكاء الاصطناعي...', 'info');
    
    // محاكاة التنظيف
    setTimeout(() => {
        showNotification('تم تنظيف الملف بنجاح!', 'success');
        
        // إظهار التقرير
        showCleanReport(options);
    }, 3000);
}

function showCleanReport(options) {
    const report = `
        <div style="background: white; padding: 24px; border-radius: 16px; max-width: 500px; margin: 20px auto;">
            <h3 style="margin-bottom: 20px; display: flex; align-items: center; gap: 10px;">
                <i class="fas fa-check-circle" style="color: #10b981;"></i>
                تقرير التنظيف
            </h3>
            <div style="display: flex; flex-direction: column; gap: 12px;">
                ${options.mergeLayers ? '<p><i class="fas fa-link" style="color: #3b82f6;"></i> تم دمج 3 طبقات متشابهة</p>' : ''}
                ${options.removeDuplicates ? '<p><i class="fas fa-clone" style="color: #f59e0b;"></i> تم إزالة 127 عنصر مكرر</p>' : ''}
                ${options.fixLayerNames ? '<p><i class="fas fa-tag" style="color: #8b5cf6;"></i> تم إعادة تسمية 5 طبقات</p>' : ''}
                ${options.removeZeroLength ? '<p><i class="fas fa-length-zero" style="color: #ef4444;"></i> تم إزالة 45 عنصر بطول صفري</p>' : ''}
            </div>
            <button onclick="this.parentElement.remove()" class="btn btn-primary" style="width: 100%; margin-top: 20px;">
                موافق
            </button>
        </div>
    `;
    
    const notification = document.createElement('div');
    notification.className = 'login-notification success';
    notification.style.cssText = 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 3000; max-width: 600px;';
    notification.innerHTML = report;
    document.body.appendChild(notification);
    
    setTimeout(() => notification.remove(), 5000);
}

function startEstimation() {
    const type = document.getElementById('estimationType').value;
    const format = document.getElementById('reportFormat').value;
    
    showNotification('جاري حساب الكميات...', 'info');
    
    setTimeout(() => {
        showNotification(`تم إنشاء تقرير ${type === 'all' ? 'شامل' : type} بنجاح!`, 'success');
        
        // محاكاة التقرير
        simulateReport(type, format);
    }, 2500);
}

function simulateReport(type, format) {
    const data = {
        areas: {
            'الإجمالي': '450 متر مربع',
            'الطابق الأول': '280 متر مربع',
            'الطابق الثاني': '170 متر مربع'
        },
        lengths: {
            'جدران خارجية': '125 متر',
            'جدران داخلية': '89 متر',
            'شبكات صرف': '45 متر'
        },
        counts: {
            'أبواب': '8',
            'نوافذ': '12',
            'مراحيض': '3'
        },
        all: {
            'المساحة الإجمالية': '450 م²',
            'عدد الغرف': '6',
            'عدد الحمامات': '3',
            'عدد الأبواب': '8',
            'عدد النوافذ': '12',
            'طول الجدران': '214 متر'
        }
    };
    
    const reportData = data[type] || data.all;
    console.log('Report generated:', reportData, 'Format:', format);
}

function startAnalysis() {
    showNotification('جاري تحليل المخطط...', 'info');
    
    setTimeout(() => {
        showNotification('تم اكتمال التحليل!', 'success');
        
        // إظهار نتائج التحليل
        showAnalysisResults();
    }, 3000);
}

function showAnalysisResults() {
    const results = `
        <div class="analysis-results" style="background: white; padding: 24px; border-radius: 16px;">
            <h4 style="margin-bottom: 16px;">نتائج التحليل</h4>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;">
                <div style="background: rgba(59, 130, 246, 0.1); padding: 16px; border-radius: 12px; text-align: center;">
                    <div style="font-size: 28px; font-weight: bold; color: #3b82f6;">156</div>
                    <div style="font-size: 13px; color: #6b7280;">طبقة</div>
                </div>
                <div style="background: rgba(16, 185, 129, 0.1); padding: 16px; border-radius: 12px; text-align: center;">
                    <div style="font-size: 28px; font-weight: bold; color: #10b981;">2,847</div>
                    <div style="font-size: 13px; color: #6b7280;">عنصر</div>
                </div>
                <div style="background: rgba(139, 92, 246, 0.1); padding: 16px; border-radius: 12px; text-align: center;">
                    <div style="font-size: 28px; font-weight: bold; color: #8b5cf6;">3</div>
                    <div style="font-size: 13px; color: #6b7280;">مشكلة</div>
                </div>
            </div>
        </div>
    `;
    
    document.querySelector('.analysis-results').innerHTML = results;
}

function sendChatMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    // إضافة رسالة المستخدم
    addChatMessage(message, 'user');
    input.value = '';
    
    // محاكاة رد المساعد
    setTimeout(() => {
        const responses = [
            'يمكنني مساعدتك في تحليل هذا الملف. ما الذي تريد معرفته؟',
            'بناءً على تحليل المخطط، المساحة الإجمالية للمبنى تبلغ 450 متر مربع.',
            'يحتوي الملف على 6 طبقات رئيسية و 12 نافذة.',
            'هل تريد معلومات إضافية عن عناصر محددة في الرسم؟',
            'يمكنني مساعدتك في تحويل هذا الملف لأي صيغة تريدها.'
        ];
        
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        addChatMessage(randomResponse, 'bot');
    }, 1000);
}

function addChatMessage(text, type) {
    const messagesContainer = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.innerHTML = `
        <div class="message-content">
            ${type === 'bot' ? '<i class="fas fa-robot"></i>' : ''}
            <p>${text}</p>
        </div>
    `;
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// ===================================
// تهيئة المشاريع
// ===================================
function initProjects() {
    // تصفية المشاريع
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    // مشروع جديد
    document.getElementById('newProjectBtn').addEventListener('click', () => {
        showNotification('ميزة إنشاء مشروع جديد قريباً!', 'info');
    });
}

// ===================================
// تهيئة GitLab
// ===================================
function initGitLab() {
    // اختيار المستودع
    document.querySelectorAll('.repo-item').forEach(repo => {
        repo.addEventListener('click', () => {
            document.querySelectorAll('.repo-item').forEach(r => r.classList.remove('active'));
            repo.classList.add('active');
        });
    });

    // إضافة مستودع
    document.getElementById('addRepoBtn').addEventListener('click', () => {
        showNotification('ميزة إضافة مستودع جديد قريباً!', 'info');
    });
}

// ===================================
// تهيئة الإعدادات
// ===================================
function initSettings() {
    // تبديل التبويبات
    document.querySelectorAll('.settings-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.dataset.tab;
            switchSettingsTab(tabName);
        });
    });
}

function switchSettingsTab(tabName) {
    document.querySelectorAll('.settings-tab').forEach(t => t.classList.remove('active'));
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    
    document.querySelectorAll('.settings-group').forEach(g => g.classList.remove('active'));
    document.getElementById(`${tabName}Settings`).classList.add('active');
}

// ===================================
// تهيئة تسجيل الدخول
// ===================================
function initLoginSystem() {
    // تبديل التبويبات
    document.querySelectorAll('.login-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.dataset.tab;
            switchToTab(tabName);
        });
    });
}

function switchToTab(tabName) {
    document.querySelectorAll('.login-tab').forEach(t => t.classList.remove('active'));
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    
    document.querySelectorAll('.login-form, .register-form').forEach(f => f.classList.remove('active'));
    
    if (tabName === 'login') {
        document.getElementById('loginForm').classList.add('active');
        document.getElementById('loginFooterText').innerHTML = 'ليس لديك حساب؟ <a href="#" onclick="switchToTab(\'register\')">سجل الآن</a>';
    } else {
        document.getElementById('registerForm').classList.add('active');
        document.getElementById('loginFooterText').innerHTML = 'لديك حساب بالفعل؟ <a href="#" onclick="switchToTab(\'login\')">سجل دخولك</a>';
    }
}

function openLoginModal() {
    document.getElementById('loginModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeLoginModal() {
    document.getElementById('loginModal').classList.remove('active');
    document.body.style.overflow = '';
}

function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const button = input.nextElementSibling.querySelector('i');
    
    if (input.type === 'password') {
        input.type = 'text';
        button.classList.remove('fa-eye');
        button.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        button.classList.remove('fa-eye-slash');
        button.classList.add('fa-eye');
    }
}

function handleLogin() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    if (!email || !password) {
        showNotification('يرجى ملء جميع الحقول', 'error');
        return;
    }
    
    // محاكاة تسجيل الدخول
    showNotification('جاري تسجيل الدخول...', 'info');
    
    setTimeout(() => {
        const user = {
            name: email.split('@')[0],
            email: email,
            avatar: generateAvatar(email)
        };
        
        saveUserSession(user);
        updateUIForLoggedInUser(user);
        closeLoginModal();
        showNotification(`مرحباً بعودتك، ${user.name}!`, 'success');
    }, 1500);
}

function handleRegister() {
    const firstName = document.getElementById('registerFirstName').value;
    const lastName = document.getElementById('registerLastName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerConfirmPassword').value;
    const agreeTerms = document.getElementById('agreeTerms').checked;
    
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
        showNotification('يرجى ملء جميع الحقول', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showNotification('كلمتا المرور غير متطابقتين', 'error');
        return;
    }
    
    if (!agreeTerms) {
        showNotification('يرجى الموافقة على الشروط والأحكام', 'error');
        return;
    }
    
    // محاكاة إنشاء حساب
    showNotification('جاري إنشاء حسابك...', 'info');
    
    setTimeout(() => {
        const user = {
            name: `${firstName} ${lastName}`,
            email: email,
            avatar: generateAvatar(email)
        };
        
        saveUserSession(user);
        updateUIForLoggedInUser(user);
        closeLoginModal();
        showNotification('تم إنشاء حسابك بنجاح!', 'success');
    }, 1500);
}

function socialLogin(provider) {
    showNotification(`جاري الاتصال بـ ${provider}...`, 'info');
    
    setTimeout(() => {
        const user = {
            name: `مستخدم ${provider}`,
            email: `user@${provider}.com`,
            avatar: generateAvatar(`user@${provider}.com`)
        };
        
        saveUserSession(user);
        updateUIForLoggedInUser(user);
        closeLoginModal();
        showNotification(`تم تسجيل الدخول عبر ${provider} بنجاح!`, 'success');
    }, 1500);
}

function generateAvatar(email) {
    return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23667eea'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z'/%3E%3C/svg%3E`;
}

function saveUserSession(user) {
    userSession = user;
    localStorage.setItem('userSession', JSON.stringify(user));
}

function loadUserSession() {
    const saved = localStorage.getItem('userSession');
    if (saved) {
        userSession = JSON.parse(saved);
        updateUIForLoggedInUser(userSession);
    }
}

function updateUIForLoggedInUser(user) {
    document.getElementById('loginBtn').style.display = 'none';
    document.getElementById('userProfile').style.display = 'flex';
    document.getElementById('userName').textContent = user.name;
    document.getElementById('userAvatar').src = user.avatar;
}

function logout() {
    userSession = null;
    localStorage.removeItem('userSession');
    document.getElementById('loginBtn').style.display = 'flex';
    document.getElementById('userProfile').style.display = 'none';
    showNotification('تم تسجيل الخروج بنجاح', 'success');
}

document.getElementById('logoutBtn').addEventListener('click', (e) => {
    e.preventDefault();
    logout();
});

// ===================================
// المصادقة عبر الهاتف (OTP)
// ===================================
function sendOTP() {
    const countryCode = document.getElementById('phoneCountry').value;
    const phoneNumber = document.getElementById('phoneNumber').value.trim();
    
    if (!phoneNumber) {
        showNotification('يرجى إدخال رقم الهاتف', 'error');
        return;
    }
    
    if (phoneNumber.length < 7) {
        showNotification('يرجى إدخال رقم هاتف صحيح', 'error');
        return;
    }
    
    showNotification('جاري إرسال رمز التحقق...', 'info');
    
    // محاكاة إرسال OTP
    setTimeout(() => {
        const fullPhone = countryCode + phoneNumber;
        document.getElementById('displayPhone').textContent = fullPhone;
        
        // الانتقال إلى الخطوة التالية
        document.getElementById('phoneStep1').classList.remove('active');
        document.getElementById('phoneStep2').classList.add('active');
        
        // التركيز على أول حقل OTP
        const otpInputs = document.querySelectorAll('.otp-input');
        if (otpInputs.length > 0) {
            otpInputs[0].focus();
        }
        
        showNotification('تم إرسال رمز التحقق بنجاح!', 'success');
    }, 1500);
}

function handleOtpInput(input, nextClass) {
    const value = input.value;
    
    // السماح فقط بالأرقام
    if (!/^\d*$/.test(value)) {
        input.value = '';
        return;
    }
    
    // الانتقال للحقل التالي عند الإدخال
    if (value.length === 1) {
        const nextInput = input.nextElementSibling;
        if (nextInput && nextInput.classList.contains('otp-input')) {
            nextInput.focus();
        }
    }
    
    // التحقق من اكتمال جميع الحقول
    checkOTPComplete();
}

function checkOTPComplete() {
    const otpInputs = document.querySelectorAll('.otp-input');
    let allFilled = true;
    let otpCode = '';
    
    otpInputs.forEach(input => {
        if (!input.value) {
            allFilled = false;
        } else {
            otpCode += input.value;
        }
    });
    
    return otpCode;
}

function verifyOTP() {
    const otpCode = checkOTPComplete();
    
    if (otpCode.length !== 5) {
        showNotification('يرجى إدخال رمز التحقق كاملاً', 'error');
        return;
    }
    
    showNotification('جاري التحقق من الرمز...', 'info');
    
    // محاكاة التحقق (الرمز التجريبي: 12345)
    setTimeout(() => {
        if (otpCode === '12345') {
            document.getElementById('phoneStep2').classList.remove('active');
            document.getElementById('phoneStep3').classList.add('active');
            showNotification('تم التحقق بنجاح!', 'success');
        } else {
            showNotification('رمز التحقق غير صحيح، يرجى المحاولة مرة أخرى', 'error');
            // مسح الحقول
            document.querySelectorAll('.otp-input').forEach(input => input.value = '');
            document.querySelector('.otp-input').focus();
        }
    }, 1000);
}

function resendOTP() {
    showNotification('جاري إعادة إرسال رمز التحقق...', 'info');
    
    setTimeout(() => {
        showNotification('تم إرسال رمز جديد بنجاح!', 'success');
    }, 1500);
}

function backToPhoneStep1() {
    document.getElementById('phoneStep2').classList.remove('active');
    document.getElementById('phoneStep1').classList.add('active');
}

function completePhoneRegistration() {
    const userName = document.getElementById('phoneUserName').value.trim();
    
    if (!userName) {
        showNotification('يرجى إدخال اسمك', 'error');
        return;
    }
    
    showNotification('جاري إتمام التسجيل...', 'info');
    
    setTimeout(() => {
        const countryCode = document.getElementById('phoneCountry').value;
        const phoneNumber = document.getElementById('phoneNumber').value.trim();
        
        const user = {
            name: userName,
            phone: countryCode + phoneNumber,
            avatar: generateAvatar(userName + '@phone.com')
        };
        
        saveUserSession(user);
        updateUIForLoggedInUser(user);
        closeLoginModal();
        showNotification(`مرحباً بك، ${user.name}!`, 'success');
        
        // إعادة تعيين النموذج
        document.getElementById('phoneNumber').value = '';
        document.getElementById('phoneUserName').value = '';
        document.querySelectorAll('.otp-input').forEach(input => input.value = '');
        document.getElementById('phoneStep3').classList.remove('active');
        document.getElementById('phoneStep1').classList.add('active');
    }, 1500);
}

// تحديث دالة switchToTab لدعم تبويب الهاتف
const originalSwitchToTab = switchToTab;
switchToTab = function(tabName) {
    // إعادة تعيين الخطوات
    document.querySelectorAll('.phone-step').forEach(step => step.classList.remove('active'));
    document.getElementById('phoneStep1').classList.add('active');
    
    document.querySelectorAll('.login-tab').forEach(t => t.classList.remove('active'));
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    
    document.querySelectorAll('.login-form, .phone-form, .register-form').forEach(f => f.classList.remove('active'));
    
    if (tabName === 'login') {
        document.getElementById('loginForm').classList.add('active');
        document.getElementById('loginFooterText').innerHTML = 'ليس لديك حساب؟ <a href="#" onclick="switchToTab(\'register\')">سجل الآن</a>';
    } else if (tabName === 'phone') {
        document.getElementById('phoneForm').classList.add('active');
        document.getElementById('loginFooterText').innerHTML = 'ليس لديك حساب؟ <a href="#" onclick="switchToTab(\'register\')">سجل الآن</a>';
    } else {
        document.getElementById('registerForm').classList.add('active');
        document.getElementById('loginFooterText').innerHTML = 'لديك حساب بالفعل؟ <a href="#" onclick="switchToTab(\'login\')">سجل دخولك</a>';
    }
};

// تصدير وظائف الهاتف للنافذة
window.sendOTP = sendOTP;
window.handleOtpInput = handleOtpInput;
window.verifyOTP = verifyOTP;
window.resendOTP = resendOTP;
window.backToPhoneStep1 = backToPhoneStep1;
window.completePhoneRegistration = completePhoneRegistration;

// ===================================
// تهيئة الوضع الداكن
// ===================================
function initTheme() {
    const themeToggle = document.getElementById('themeToggle');
    const savedTheme = localStorage.getItem('theme');
    
    // تطبيق الوضع المحفوظ
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        isDarkMode = true;
    } else if (savedTheme === 'light') {
        document.body.classList.remove('dark-mode');
        isDarkMode = false;
    } else {
        // تلقائي حسب النظام
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.body.classList.add('dark-mode');
            isDarkMode = true;
        }
    }
    
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        isDarkMode = !isDarkMode;
        localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    });
}

// ===================================
// تخصيص المظهر
// ===================================
function initCustomization() {
    // لون的主题
    const primaryColorSelect = document.getElementById('primaryColorSelect');
    if (primaryColorSelect) {
        primaryColorSelect.addEventListener('change', (e) => {
            const color = e.target.value;
            document.documentElement.style.setProperty('--primary-color', getColorValue(color));
            document.documentElement.style.setProperty('--primary-dark', getDarkColorValue(color));
            localStorage.setItem('primaryColor', color);
        });
        
        const savedColor = localStorage.getItem('primaryColor');
        if (savedColor) {
            primaryColorSelect.value = savedColor;
            document.documentElement.style.setProperty('--primary-color', getColorValue(savedColor));
            document.documentElement.style.setProperty('--primary-dark', getDarkColorValue(savedColor));
        }
    }
}

function getColorValue(color) {
    const colors = {
        purple: '#3B82F6',
        blue: '#2563eb',
        green: '#10B981',
        orange: '#F59E0B',
        red: '#EF4444'
    };
    return colors[color] || colors.purple;
}

function getDarkColorValue(color) {
    const colors = {
        purple: '#2563eb',
        blue: '#1d4ed8',
        green: '#059669',
        orange: '#d97706',
        red: '#dc2626'
    };
    return colors[color] || colors.purple;
}

// ===================================
// الإشعارات
// ===================================
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `login-notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${getNotificationIcon(type)}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    // تموضع الإشعار
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        padding: 16px 24px;
        background: ${getNotificationBg(type)};
        color: ${getNotificationColor(type)};
        border-radius: 12px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 14px;
        font-weight: 500;
        z-index: 3000;
        animation: slideInRight 0.3s ease;
        max-width: 350px;
    `;
    
    setTimeout(() => {
        notification.style.animation = 'fadeOut 0.3s ease forwards';
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

function getNotificationIcon(type) {
    const icons = {
        success: 'check-circle',
        error: 'times-circle',
        warning: 'exclamation-triangle',
        info: 'info-circle'
    };
    return icons[type] || icons.info;
}

function getNotificationBg(type) {
    const bgs = {
        success: 'rgba(16, 185, 129, 0.95)',
        error: 'rgba(239, 68, 68, 0.95)',
        warning: 'rgba(245, 158, 11, 0.95)',
        info: 'rgba(59, 130, 246, 0.95)'
    };
    return bgs[type] || bgs.info;
}

function getNotificationColor(type) {
    const colors = {
        success: 'white',
        error: 'white',
        warning: 'white',
        info: 'white'
    };
    return colors[type] || 'white';
}

// ===================================
// Service Worker للتخزين المؤقت
// ===================================
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('ServiceWorker registered:', registration.scope);
            })
            .catch(error => {
                console.log('ServiceWorker registration failed:', error);
            });
    });
}

// ===================================
// تصدير للاستخدام العام
// ===================================
window.openLoginModal = openLoginModal;
window.closeLoginModal = closeLoginModal;
window.switchToTab = switchToTab;
window.togglePassword = togglePassword;
window.handleLogin = handleLogin;
window.handleRegister = handleRegister;
window.socialLogin = socialLogin;
window.showDWGViewer = showDWGViewer;
window.closeDWGViewer = closeDWGViewer;
window.removeFile = removeFile;
window.viewFile = viewFile;
