let currentUsername = 'eributtler';
let userPosts = JSON.parse(localStorage.getItem('koneat_posts') || '[]');
let userStories = JSON.parse(localStorage.getItem('koneat_stories') || '[]');
let userVirals = JSON.parse(localStorage.getItem('koneat_virals') || '[]');

function setUsername(name) {
    if (!name) return;
    name = name.toLowerCase().replace(/[^a-z0-9._]/g, '');
    currentUsername = name;
    var profileTopName = document.getElementById('headerUsername');
    if(profileTopName) {
        const isPrivate = localStorage.getItem("koneat_private_account") === "true";
        profileTopName.textContent = name + (isPrivate ? " 🔒" : "");
    }
}

function go(n) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    var el = document.getElementById('screen-' + n);
    if (el) el.classList.add('active');
    
    var dropdownMenu = document.getElementById('dropdownMenu');
    if(dropdownMenu) dropdownMenu.classList.remove('show');
    
    document.querySelectorAll('.nav').forEach(navBar => {
        navBar.querySelectorAll('button').forEach(b => {
            const isPlus = b.getAttribute('data-go') === 'plus';
            if (isPlus) {
                b.classList.toggle('on', n === 'plus');
                const svgRect = b.querySelector('rect');
                const svgPath = b.querySelector('path');
                if (n === 'plus') {
                    if(svgRect) { svgRect.setAttribute('fill', '#fff'); svgRect.setAttribute('stroke', '#fff'); }
                    if(svgPath) { svgPath.setAttribute('stroke', '#111'); }
                } else {
                    if(svgRect) { svgRect.setAttribute('fill', 'none'); svgRect.setAttribute('stroke', '#fff'); }
                    if(svgPath) { svgPath.setAttribute('stroke', '#fff'); }
                }
            } else {
                b.classList.toggle('on', b.getAttribute('data-go') === n);
            }
        });
    });

    if (n === 'home') {
        updateHomeSubnavIndicator();
        renderHomeFeed();
        renderStoriesBar();
    } else if (n === 'perfil') {
        updateProfileTabIndicator();
        renderProfileGrid();
    } else if (n === 'video') {
        renderViralsFeed();
    }
}

function updateHomeSubnavIndicator() {
    var t = document.querySelector('.subnav-tab.active');
    var ind = document.getElementById('subnavIndicator');
    if (t && ind) {
        ind.style.width = t.getBoundingClientRect().width + 'px';
        ind.style.left = t.offsetLeft + 'px';
    }
}

function updateProfileTabIndicator() {
    var t = document.querySelector('.p-tabs .tab-btn.active');
    var ind = document.getElementById('profileTabIndicator');
    if (t && ind) {
        ind.style.width = t.offsetWidth + 'px';
        ind.style.left = t.offsetLeft + 'px';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const menuBtn = document.getElementById('menuBtn');
    const dropdownMenu = document.getElementById('dropdownMenu');
    if(menuBtn && dropdownMenu) {
        menuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdownMenu.classList.toggle('show');
        });
        document.addEventListener('click', () => {
            dropdownMenu.classList.remove('show');
        });
    }

    document.querySelectorAll('.subnav-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.subnav-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            updateHomeSubnavIndicator();
        });
    });
    updateHomeSubnavIndicator();

    const profileTabs = document.querySelectorAll('.p-tabs .tab-btn');
    profileTabs.forEach(btn => {
        btn.addEventListener('click', () => {
            profileTabs.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            updateProfileTabIndicator();
            renderProfileGrid();
        });
    });
    updateProfileTabIndicator();

    const createTabs = document.querySelectorAll('#screen-create .create-tab');
    const indicator = document.getElementById('createTabIndicator');
    const previewText = document.getElementById('previewText');

    function updateCreateIndicator(activeTab, indEl) {
        if(indEl && activeTab) {
            indEl.style.width = activeTab.offsetWidth + 'px';
            indEl.style.left = activeTab.offsetLeft + 'px';
        }
    }

    createTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            createTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            selectedType = tab.dataset.type;
            updateCreateIndicator(tab, indicator);
            if(previewText) {
                if(selectedType === 'post') previewText.textContent = 'Adicionar imagem ou vídeo feed';
                else if(selectedType === 'story') previewText.textContent = 'Adicionar story';
                else if(selectedType === 'viral') previewText.textContent = 'Adicionar feed viral';
            }
        });
    });

    const plusTabs = document.querySelectorAll('#screen-plus .create-tab');
    const plusIndicator = document.getElementById('plusTabIndicator');
    const plusPreviewText = document.getElementById('plusPreviewText');

    plusTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            plusTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            selectedType = tab.dataset.type;
            updateCreateIndicator(tab, plusIndicator);
            if(plusPreviewText) {
                if(selectedType === 'post') plusPreviewText.textContent = 'Faça um post no feed';
                else if(selectedType === 'story') plusPreviewText.textContent = 'Adicionar story';
                else if(selectedType === 'viral') plusPreviewText.textContent = 'Adicionar feed viral';
            }
        });
    });

    setTimeout(() => {
        const activeCreate = document.querySelector('#screen-create .create-tab.active');
        if(activeCreate) updateCreateIndicator(activeCreate, indicator);
        const activePlus = document.querySelector('#screen-plus .create-tab.active');
        if(activePlus) updateCreateIndicator(activePlus, plusIndicator);
    }, 100);

    document.querySelectorAll('.nav button[data-go]').forEach(b => {
        b.addEventListener('click', function(e) {
            e.preventDefault();
            var d = this.getAttribute('data-go');
            if (d === 'plus') {
                go('plus');
            } else {
                go(d);
            }
        });
    });

    renderProfileGrid();
    renderHomeFeed();
    renderStoriesBar();
});

let selectedType = 'post', lastScreen = 'perfil', lastSource = 'perfil';
let mediaFile = null, mediaType = 'image';

function openCreate(type, source) {
    lastScreen = 'perfil';
    lastSource = source || 'perfil';
    
    document.querySelectorAll('#screen-create .create-tab').forEach(t => {
        if(t.dataset.type === type) t.click();
    });

    go('create');
}

function closeCreate() {
    go(lastScreen || 'home');
}

const postInput = document.getElementById('postInput');
const cameraInput = document.getElementById('cameraInput');
const imagePreview = document.getElementById('imagePreview');
const videoPreview = document.getElementById('videoPreview');
const emptyState = document.getElementById('emptyState');

const plusImagePreview = document.getElementById('plusImagePreview');
const plusVideoPreview = document.getElementById('plusVideoPreview');

function handleFileSelection(file) {
    if (!file) return;
    mediaFile = file;
    mediaType = file.type.startsWith('video') ? 'video' : 'image';

    const reader = new FileReader();
    reader.onload = function(e) {
        if(emptyState) emptyState.style.display = 'none';
        if(mediaType === 'image') {
            if(imagePreview) { imagePreview.src = e.target.result; imagePreview.style.display = 'block'; }
            if(videoPreview) videoPreview.style.display = 'none';
            if(plusImagePreview) { plusImagePreview.src = e.target.result; plusImagePreview.style.display = 'block'; }
            if(plusVideoPreview) plusVideoPreview.style.display = 'none';
        } else {
            if(videoPreview) { videoPreview.src = e.target.result; videoPreview.style.display = 'block'; }
            if(imagePreview) imagePreview.style.display = 'none';
            if(plusVideoPreview) { plusVideoPreview.src = e.target.result; plusVideoPreview.style.display = 'block'; }
            if(plusImagePreview) plusImagePreview.style.display = 'none';
        }
        setTimeout(() => {
            openCaptionModal(e.target.result);
        }, 300);
    };
    reader.readAsDataURL(file);
}

if(postInput) postInput.addEventListener('change', (e) => handleFileSelection(e.target.files[0]));
if(cameraInput) cameraInput.addEventListener('change', (e) => handleFileSelection(e.target.files[0]));

const storyDirectInput = document.getElementById('storyDirectInput');
function triggerStoryInput() {
    if(storyDirectInput) storyDirectInput.click();
}

if(storyDirectInput) {
    storyDirectInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if(!file) return;
        const reader = new FileReader();
        reader.onload = function(evt) {
            const now = Date.now();
            const newStory = {
                id: now,
                src: evt.target.result,
                type: file.type.startsWith('video') ? 'video' : 'image',
                user: currentUsername,
                timestamp: now
            };
            userStories.unshift(newStory);
            localStorage.setItem('koneat_stories', JSON.stringify(userStories));
            renderStoriesBar();
            alert('Story publicado com sucesso!');
        };
        reader.readAsDataURL(file);
    });
}

const advanceButton = document.getElementById('advanceButton');
const advanceButtonBottom = document.getElementById('advanceButtonBottom');
const plusAdvanceBtn = document.getElementById('plusAdvanceBtn');

[advanceButton, advanceButtonBottom, plusAdvanceBtn].forEach(btn => {
    btn?.addEventListener('click', () => {
        if(!mediaFile) {
            postInput.click();
        } else {
            const reader = new FileReader();
            reader.onload = (e) => openCaptionModal(e.target.result);
            reader.readAsDataURL(mediaFile);
        }
    });
});

function openCaptionModal(src) {
    const modalThumb = document.getElementById('modalThumb');
    if(modalThumb) modalThumb.src = src;
    go('caption');
}

const publishBtn = document.getElementById('publishBtn');
const closeModalBtn = document.getElementById('closeModalBtn');
const captionInput = document.getElementById('captionInput');

closeModalBtn?.addEventListener('click', () => {
    if (document.getElementById('screen-create').classList.contains('active')) {
        go('perfil');
    } else {
        go('home');
    }
});

publishBtn?.addEventListener('click', () => {
    const caption = captionInput ? captionInput.value : '';
    const src = document.getElementById('modalThumb').src;
    const now = Date.now();

    const newPostData = {
        id: now,
        src: src,
        type: mediaType,
        caption: caption,
        user: currentUsername,
        timestamp: now
    };

    if (selectedType === 'post') {
        userPosts.unshift(newPostData);
        localStorage.setItem('koneat_posts', JSON.stringify(userPosts));
    } else if (selectedType === 'story') {
        userStories.unshift(newPostData);
        localStorage.setItem('koneat_stories', JSON.stringify(userStories));
    } else if (selectedType === 'viral') {
        userVirals.unshift(newPostData);
        localStorage.setItem('koneat_virals', JSON.stringify(userVirals));
    }

    if(captionInput) captionInput.value = '';
    mediaFile = null;
    
    alert('Publicado com sucesso!');
    go('home');
});

function renderProfileGrid() {
    const grid = document.getElementById('perfilGrid');
    const empty = document.getElementById('perfilEmpty');
    const emptyMsgText = document.getElementById('emptyMsgText');
    const emptyBtnAction = document.getElementById('emptyBtnAction');
    const countPosts = document.getElementById('countPosts');
    
    if(!grid) return;
    
    const activeTabBtn = document.querySelector('.p-tabs .tab-btn.active');
    const tabName = activeTabBtn ? activeTabBtn.dataset.gridTab : 'todos';

    let itemsToRender = [];
    if(tabName === 'todos') {
        itemsToRender = [...userPosts, ...userVirals];
    } else if(tabName === 'reposts') {
        itemsToRender = userVirals;
    } else {
        itemsToRender = [];
    }

    if(countPosts) countPosts.textContent = itemsToRender.length;

    if(itemsToRender.length === 0) {
        grid.innerHTML = '';
        grid.classList.remove('active');
        if(empty) empty.style.display = 'flex';

        if(tabName === 'todos') {
            if(emptyMsgText) emptyMsgText.textContent = userPosts.length === 0 ? 'Crie seu primeiro post' : 'Nenhuma publicação';
            if(emptyBtnAction) {
                emptyBtnAction.style.display = 'inline-block';
                emptyBtnAction.textContent = 'Crie seu primeiro post';
                emptyBtnAction.onclick = () => openCreate('post', 'perfil');
            }
        } else if(tabName === 'reposts') {
            if(emptyMsgText) emptyMsgText.textContent = 'Ainda não tem reposts';
            if(emptyBtnAction) emptyBtnAction.style.display = 'none';
        } else if(tabName === 'marcacoes') {
            if(emptyMsgText) emptyMsgText.textContent = 'Ainda não tem Marcações';
            if(emptyBtnAction) emptyBtnAction.style.display = 'none';
        }
        return;
    }

    if(empty) empty.style.display = 'none';
    grid.classList.add('active');
    grid.innerHTML = '';

    itemsToRender.forEach(item => {
        const div = document.createElement('div');
        div.className = 'grid-item';
        div.innerHTML = `
            ${item.type === 'video' ? `<video src="${item.src}"></video><div class="badge-video"><svg width="14" height="14" viewBox="0 0 24 24" fill="#fff"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg></div>` : `<img src="${item.src}">`}
            <button class="btn-del" onclick="deleteItem(${item.id})">🗑️</button>
        `;
        grid.appendChild(div);
    });
}

function deleteItem(id) {
    if(confirm('Deseja realmente deletar esta publicação?')) {
        userPosts = userPosts.filter(p => p.id !== id);
        userVirals = userVirals.filter(v => v.id !== id);
        localStorage.setItem('koneat_posts', JSON.stringify(userPosts));
        localStorage.setItem('koneat_virals', JSON.stringify(userVirals));
        renderProfileGrid();
        renderHomeFeed();
    }
}

function renderHomeFeed() {
    const feed = document.getElementById('postsDynamicFeed');
    if(!feed) return;

    if(userPosts.length === 0) {
        feed.innerHTML = `<div class="empty-home-feed" id="homeEmpty">Nenhuma publicação no momento.<br>Crie um post para começar!</div>`;
        return;
    }

    feed.innerHTML = '';
    userPosts.forEach(post => {
        const card = document.createElement('div');
        card.className = 'post-card';
        card.innerHTML = `
            <div class="post-header">
                <div class="post-author-info">
                    <div class="author-avatar">${post.user.charAt(0).toUpperCase()}</div>
                    <span style="font-weight:700;font-size:14px">${post.user}</span>
                </div>
            </div>
            <div class="post-media-wrapper">
                ${post.type === 'video' ? `<video src="${post.src}" controls playsinline></video>` : `<img src="${post.src}">`}
            </div>
            <div class="post-actions-bar">
                <div class="post-actions-left">
                    <button class="post-action-btn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg></button>
                    <button class="post-action-btn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg></button>
                </div>
            </div>
            <div class="post-caption-area">
                <span class="post-caption-author">${post.user}</span>${post.caption || ''}
            </div>
        `;
        feed.appendChild(card);
    });
}

function renderStoriesBar() {
    const bar = document.getElementById('storiesBar');
    if(!bar) return;

    const now = Date.now();
    const activeStories = userStories.filter(s => (now - s.timestamp) < (24 * 3600 * 1000));

    let html = `
        <div class="story-item" onclick="triggerStoryInput()">
            <div class="story-avatar-wrap">
                <div class="story-avatar" id="storyAvatar" style="border: 1.5px solid #000;"><svg viewBox="0 0 24 24" fill="none" stroke="#8e8e93" stroke-width="1.8"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>
                <div class="story-add-badge" onclick="event.stopPropagation(); triggerStoryInput();">+</div>
            </div>
            <span class="story-username">seu story</span>
        </div>
    `;

    activeStories.forEach(story => {
        html += `
            <div class="story-item" onclick="viewStory(${story.id})">
                <div class="story-avatar-wrap">
                    <div class="story-avatar" style="border: 2px solid #e1306c;"><img src="${story.src}"></div>
                </div>
                <span class="story-username">${story.user}</span>
            </div>
        `;
    });

    bar.innerHTML = html;
}

function viewStory(id) {
    const story = userStories.find(s => s.id === id);
    if(!story) return;

    const modalId = 'storyViewerModal';
    let modal = document.getElementById(modalId);
    if(!modal) {
        modal = document.createElement('div');
        modal.id = modalId;
        modal.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;background:#000;z-index:99999;display:flex;flex-direction:column;justify-content:space-between;padding:20px;color:#fff;";
        document.body.appendChild(modal);
    }

    modal.innerHTML = `
        <div style="display:flex;flex-direction:column;gap:8px;">
            <div style="width:100%;height:3px;background:rgba(255,255,255,0.3);border-radius:2px;overflow:hidden;">
                <div id="storyProgressBar" style="width:0%;height:100%;background:#fff;transition:width 30s linear;"></div>
            </div>
            <div style="display:flex;align-items:center;justify-content:space-between;">
                <div style="display:flex;align-items:center;gap:10px;">
                    <div style="width:32px;height:32px;border-radius:50%;overflow:hidden;background:#333;"><img src="${story.src}" style="width:100%;height:100%;object-fit:cover;"></div>
                    <span style="font-weight:700;font-size:14px;">${story.user}</span>
                </div>
                <div style="display:flex;gap:12px;align-items:center;">
                    <button onclick="deleteStory(${story.id})" style="background:none;border:none;cursor:pointer;font-size:18px;" title="Deletar Story">🗑️</button>
                    <button onclick="closeStoryViewer()" style="background:none;border:none;color:#fff;font-size:22px;cursor:pointer;">✕</button>
                </div>
            </div>
        </div>
        <div style="flex:1;display:flex;align-items:center;justify-content:center;position:relative;margin:10px 0;">
            <img src="${story.src}" style="max-width:100%;max-height:100%;object-fit:contain;border-radius:12px;">
        </div>
        <div style="display:flex;align-items:center;gap:12px;">
            <input type="text" placeholder="Enviar mensagem..." style="flex:1;background:transparent;border:1px solid rgba(255,255,255,0.4);border-radius:24px;padding:12px 16px;color:#fff;outline:none;">
            <button style="background:none;border:none;cursor:pointer;"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg></button>
        </div>
    `;
    modal.style.display = 'flex';

    setTimeout(() => {
        const bar = document.getElementById('storyProgressBar');
        if(bar) bar.style.width = '100%';
    }, 50);

    window.storyTimeout = setTimeout(() => {
        closeStoryViewer();
    }, 30000);
}

function closeStoryViewer() {
    const modal = document.getElementById('storyViewerModal');
    if(modal) modal.style.display = 'none';
    if(window.storyTimeout) clearTimeout(window.storyTimeout);
}

function deleteStory(id) {
    if(confirm('Deseja apagar este story?')) {
        userStories = userStories.filter(s => s.id !== id);
        localStorage.setItem('koneat_stories', JSON.stringify(userStories));
        closeStoryViewer();
        renderStoriesBar();
    }
}

function renderViralsFeed() {
    const container = document.getElementById('reelsContainer');
    if(!container) return;

    if(userVirals.length === 0) {
        container.innerHTML = `<div class="empty-video" id="videoEmpty"><span>Vídeos virais aparecerão aqui</span></div>`;
        return;
    }

    container.innerHTML = '';
    userVirals.forEach(viral => {
        const card = document.createElement('div');
        card.className = 'reel-card';
        card.innerHTML = `
            <video src="${viral.src}" class="reel-video" autoplay loop playsinline></video>
            <div class="video-footer">
                <div class="creator-row"><span class="creator-name">@${viral.user}</span></div>
                <div style="font-size:13px;color:#fff">${viral.caption || ''}</div>
            </div>
        `;
        container.appendChild(card);
    });
}

var loginForm = document.getElementById('loginForm');
if(loginForm) {
    loginForm.addEventListener('submit', e => {
        e.preventDefault();
        var emailInput = document.getElementById('loginEmail');
        var em = emailInput ? emailInput.value.trim() : 'eributtler';
        var nameFromEmail = em ? em.split('@')[0] : 'eributtler';
        setUsername(nameFromEmail);
        setTimeout(() => {
            go('perfil');
        }, 50);
    });
}

var signupForm = document.getElementById('signupForm');
if(signupForm) {
    signupForm.addEventListener('submit', e => {
        e.preventDefault();
        var u = document.getElementById('cadUser').value.trim();
        if (!u) { alert('Preencha o usuário.'); return; }
        setUsername(u);
        setTimeout(() => {
            go('perfil');
        }, 50);
    });
}
