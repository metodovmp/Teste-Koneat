/* ==========================================================
   KONEAT - APP ENGINE & CONFIGURATIONS LOGIC
   ========================================================== */

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
    var msgUsername = document.getElementById('messagesCurrentUsername');
    if(msgUsername) {
        msgUsername.textContent = '@' + name;
    }
}

/* ==========================================================
   ROTEAMENTO SPA INTELIGENTE (COM SUPORTE A PRIVACIDADE/TERMOS E MENSAGENS)
   ========================================================== */
let legalReturnScreen = 'config';
let blocksReturnScreen = 'atividades'; 
let connectionsReturnScreen = 'perfil';

function go(n) {
    if (n === 'privacidade' || n === 'termos') {
        const activeScreen = document.querySelector('.screen.active');
        if (activeScreen && activeScreen.id === 'screen-perfil') {
            legalReturnScreen = 'perfil';
        } else {
            legalReturnScreen = 'config';
        }
    }

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
    } else if (n === 'config') {
        syncConfigUI();
    } else if (n === 'informacoes-conta') {
        syncAccountInfoUI();
    } else if (n === 'atividades') {
        syncActivitiesUI();
    } else if (n === 'mensagens') {
        const msgUser = document.getElementById('messagesCurrentUsername');
        if(msgUser) msgUser.textContent = '@' + (currentUsername || 'eributtler');
    }
}

function goBackFromLegal() {
    go(legalReturnScreen || 'config');
}

function openFollowersScreen() {
    connectionsReturnScreen = 'perfil';
    const titleEl = document.getElementById('seguidoresUsernameTitle');
    if(titleEl) titleEl.textContent = '@' + (currentUsername || 'koneat_user');
    go('seguidores');
}

function openFollowingScreen() {
    connectionsReturnScreen = 'perfil';
    const titleEl = document.getElementById('seguindoUsernameTitle');
    if(titleEl) titleEl.textContent = '@' + (currentUsername || 'koneat_user');
    go('seguindo');
}

function openBloqueiosFrom(source) {
    blocksReturnScreen = source || 'atividades';
    go('bloqueios');
}

function goBackFromConnections() {
    go(connectionsReturnScreen || 'perfil');
}

function goBackFromBlocks() {
    go(blocksReturnScreen || 'atividades');
}

function switchBlockTab(evt, tabId) {
    document.querySelectorAll('#screen-bloqueios .tab-conn-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('#screen-bloqueios .tab-content').forEach(content => {
        content.classList.remove('active');
        content.style.display = 'none';
    });

    evt.currentTarget.classList.add('active');
    const target = document.getElementById(tabId);
    if(target) {
        target.classList.add('active');
        target.style.display = 'block';
    }
}

/* Lógica das abas da tela de Mensagens (Direct) */
function switchMsgTab(evt, paneId) {
    document.querySelectorAll('#screen-mensagens .tab-msg-btn').forEach(btn => {
        btn.classList.remove('active');
        btn.style.fontWeight = '600';
        btn.style.color = '#8e8e93';
        btn.style.borderBottom = '2px solid transparent';
    });

    evt.currentTarget.classList.add('active');
    evt.currentTarget.style.fontWeight = '700';
    evt.currentTarget.style.color = '#000';
    evt.currentTarget.style.borderBottom = '2px solid #000';

    document.querySelectorAll('#screen-mensagens .tab-pane').forEach(pane => {
        pane.classList.remove('active');
        pane.style.display = 'none';
    });

    const target = document.getElementById(paneId);
    if(target) {
        target.classList.add('active');
        target.style.display = 'block';
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

    initEditProfile();
    initShareProfile();
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

/* ==========================================================
   MÓDULO DE CONFIGURAÇÕES E BOTTOM-SHEETS
   ========================================================== */

function syncConfigUI() {
    const isPrivate = localStorage.getItem('koneat_private_account') === 'true';
    const notifEnabled = localStorage.getItem('koneat_notifications') !== 'false';
    const savedLang = localStorage.getItem('koneat_language') || 'Português (Brasil)';

    const togglePrivate = document.getElementById('togglePrivate');
    const subtitlePrivate = document.getElementById('subtitlePrivate');
    const toggleNotif = document.getElementById('toggleNotif');
    const subtitleIdioma = document.getElementById('subtitleIdioma');

    if (togglePrivate) togglePrivate.checked = isPrivate;
    if (subtitlePrivate) subtitlePrivate.textContent = isPrivate ? 'Privada' : 'Pública';
    if (toggleNotif) toggleNotif.checked = notifEnabled;
    if (subtitleIdioma) subtitleIdioma.textContent = savedLang;

    document.querySelectorAll('#sheetIdioma .lang-option').forEach(opt => {
        opt.classList.toggle('selected', opt.dataset.lang === savedLang);
    });
}

document.getElementById('togglePrivate')?.addEventListener('change', function () {
    const isPriv = this.checked;
    localStorage.setItem('koneat_private_account', isPriv ? 'true' : 'false');
    const sub = document.getElementById('subtitlePrivate');
    if (sub) sub.textContent = isPriv ? 'Privada' : 'Pública';
    setUsername(currentUsername);
    logActivity(isPriv ? 'Conta alterada para Privada' : 'Conta alterada para Pública');
});

document.getElementById('toggleNotif')?.addEventListener('change', function () {
    localStorage.setItem('koneat_notifications', this.checked ? 'true' : 'false');
    logActivity(this.checked ? 'Notificações ativadas' : 'Notificações desativadas');
});

document.getElementById('saveConfigBtn')?.addEventListener('click', () => {
    logActivity('Configurações salvas');
    alert('Alterações salvas com sucesso!');
    go('perfil');
});

function openIdiomaSheet() {
    document.getElementById('sheetIdioma')?.classList.add('show');
}
function closeIdiomaSheet() {
    document.getElementById('sheetIdioma')?.classList.remove('show');
}
function selectIdioma(el) {
    const lang = el.dataset.lang;
    localStorage.setItem('koneat_language', lang);
    document.querySelectorAll('#sheetIdioma .lang-option').forEach(opt => opt.classList.remove('selected'));
    el.classList.add('selected');
    const sub = document.getElementById('subtitleIdioma');
    if (sub) sub.textContent = lang;
    logActivity('Idioma alterado para ' + lang);
    setTimeout(closeIdiomaSheet, 180);
}

function openDeleteSheet() {
    const input = document.getElementById('deletePasswordInput');
    if (input) input.value = '';
    document.getElementById('sheetDelete')?.classList.add('show');
}
function closeDeleteSheet() {
    document.getElementById('sheetDelete')?.classList.remove('show');
}
function confirmAccountDeletion() {
    const pass = document.getElementById('deletePasswordInput')?.value.trim();
    if (!pass) {
        alert('Digite sua senha ou PIN atual para confirmar.');
        return;
    }
    localStorage.clear();
    closeDeleteSheet();
    alert('Conta excluída definitivamente.');
    go('login');
}

function syncAccountInfoUI() {
    const profileData = JSON.parse(localStorage.getItem('koneat_profile') || '{}');
    const isPrivate = localStorage.getItem('koneat_private_account') === 'true';

    document.getElementById('infoUsername').textContent = '@' + (profileData.username || currentUsername);
    document.getElementById('infoName').textContent = profileData.name || 'Usuário Koneat';
    document.getElementById('infoPrivacy').textContent = isPrivate ? 'Privada' : 'Pública';
    document.getElementById('infoBirth').textContent = profileData.birth || 'Não informada';
    document.getElementById('infoGender').textContent = profileData.gender || 'Não informado';
}

function syncActivitiesUI() {
    const totalPosts = userPosts.length;
    const totalReposts = userVirals.length;
    document.getElementById('statPostsCount').textContent = totalPosts;
    document.getElementById('statReposts').textContent = totalReposts;
    document.getElementById('statInteractions').textContent = totalPosts + totalReposts;

    const history = JSON.parse(localStorage.getItem('koneat_history') || 'null') || [
        { text: 'Configurações de perfil atualizadas', date: 'Hoje' },
        { text: 'Conta criada no Koneat', date: 'Recentemente' }
    ];
    const listEl = document.getElementById('historyList');
    if (listEl) {
        listEl.innerHTML = history.length === 0
            ? '<div class="history-item"><span class="history-date">Nenhuma atividade registrada.</span></div>'
            : history.map(h => `<div class="history-item"><span class="history-text">${h.text}</span><span class="history-date">${h.date}</span></div>`).join('');
    }
}

function logActivity(text) {
    const history = JSON.parse(localStorage.getItem('koneat_history') || '[]');
    history.unshift({ text, date: 'Agora' });
    localStorage.setItem('koneat_history', JSON.stringify(history.slice(0, 15)));
}

function clearActivityHistory() {
    if (confirm('Deseja limpar todo o histórico de atividades?')) {
        localStorage.setItem('koneat_history', '[]');
        syncActivitiesUI();
    }
}

/* ==========================================================
   MÓDULO: EDITAR PERFIL E COMPARTILHAR PERFIL
   ========================================================== */
function initEditProfile() {
  const editName = document.getElementById("editName");
  const editUsername = document.getElementById("editUsername");
  const editBio = document.getElementById("editBio");
  const editBirth = document.getElementById("editBirth");
  const editGender = document.getElementById("editGender");
  const saveBtn = document.getElementById("saveProfileBtn");
  if (!editName || !saveBtn) return;

  editName.value = localStorage.getItem("koneat_name") || "";
  editUsername.value = (localStorage.getItem("koneat_username") || "").replace("@","").toLowerCase();
  editBio.value = localStorage.getItem("koneat_bio") || "";
  if (editBirth) editBirth.value = localStorage.getItem("koneat_birth") || "";
  if (editGender) editGender.value = localStorage.getItem("koneat_gender") || "";

  function updateEditCounts() {
    const c1 = document.getElementById("countContato");
    const c2 = document.getElementById("countLink");
    const c3 = document.getElementById("countLocal");
    if (c1) c1.textContent = localStorage.getItem("koneat_whatsapp") ? "1" : "0";
    if (c2) c2.textContent = localStorage.getItem("koneat_url_link") ? "1" : "0";
    if (c3) c3.textContent = localStorage.getItem("koneat_localizacao") ? "1" : "0";
  }
  updateEditCounts();

  saveBtn.addEventListener("click", (e) => {
    e.preventDefault();
    localStorage.setItem("koneat_name", editName.value.trim());
    localStorage.setItem("koneat_username", editUsername.value.trim().replace("@","").toLowerCase());
    localStorage.setItem("koneat_bio", editBio.value.trim());
    if (editBirth) localStorage.setItem("koneat_birth", editBirth.value.trim());
    if (editGender) localStorage.setItem("koneat_gender", editGender.value.trim());

    if (editUsername.value) setUsername(editUsername.value);
    const profileNameEl = document.getElementById('profileName');
    if(profileNameEl) profileNameEl.textContent = editName.value.trim();
    const profileBioEl = document.getElementById('profileBio');
    if(profileBioEl) profileBioEl.textContent = editBio.value.trim();

    logActivity('Configurações de perfil atualizadas');
    alert('Perfil atualizado com sucesso!');
    go('perfil');
  });

  document.getElementById("btnOpenContato")?.addEventListener("click", () => {
    const i = document.getElementById("inputWhatsapp");
    if (i) i.value = localStorage.getItem("koneat_whatsapp") || "";
    document.getElementById("modalContato")?.classList.add("show");
  });
  document.getElementById("btnOpenLink")?.addEventListener("click", () => {
    const u = document.getElementById("inputUrlLink");
    const t = document.getElementById("inputTitleLink");
    if (u) u.value = localStorage.getItem("koneat_url_link") || "";
    if (t) t.value = localStorage.getItem("koneat_title_link") || "";
    document.getElementById("modalLink")?.classList.add("show");
  });
  document.getElementById("btnOpenLocal")?.addEventListener("click", () => {
    const l = document.getElementById("inputLocalizacao");
    if (l) l.value = localStorage.getItem("koneat_localizacao") || "";
    document.getElementById("modalLocal")?.classList.add("show");
  });
  document.getElementById("btnOpenConfig")?.addEventListener("click", () => go("config"));

  document.getElementById("btnSaveContato")?.addEventListener("click", () => {
    const i = document.getElementById("inputWhatsapp");
    localStorage.setItem("koneat_whatsapp", i ? i.value.trim() : "");
    document.getElementById("modalContato")?.classList.remove("show");
    updateEditCounts();
  });
  document.getElementById("btnSaveLink")?.addEventListener("click", () => {
    const u = document.getElementById("inputUrlLink");
    const t = document.getElementById("inputTitleLink");
    localStorage.setItem("koneat_url_link", u ? u.value.trim() : "");
    localStorage.setItem("koneat_title_link", t ? t.value.trim() : "");
    document.getElementById("modalLink")?.classList.remove("show");
    updateEditCounts();
  });
  document.getElementById("btnSaveLocal")?.addEventListener("click", () => {
    const l = document.getElementById("inputLocalizacao");
    localStorage.setItem("koneat_localizacao", l ? l.value.trim() : "");
    document.getElementById("modalLocal")?.classList.remove("show");
    updateEditCounts();
  });
}

function initShareProfile() {
  const btn = document.getElementById("btnShareProfile");
  if (!btn) return;

  btn.addEventListener("click", async (e) => {
    e.preventDefault();
    const username = (localStorage.getItem("koneat_username") || currentUsername || "erivelto777silva").replace("@","").trim();
    const shareData = {
      title: "Confira meu perfil no Koneat!",
      text: "Confira meu perfil no Koneat!",
      url: window.location.origin + window.location.pathname + "?u=" + username
    };

    if (navigator.share) {
      try { await navigator.share(shareData); } catch (e) {}
      return;
    }

    try {
      await navigator.clipboard.writeText(shareData.text + " " + shareData.url);
      alert("Link do perfil copiado!");
    } catch (e) {
      prompt("Copie o link do seu perfil:", shareData.url);
    }
  });
}
