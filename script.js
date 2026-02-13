document.addEventListener('DOMContentLoaded', () => {
    // --- Elements ---
    const form = document.getElementById('pack-form');
    const previewBox = document.getElementById('live-preview');
    const codeOutput = document.getElementById('code-output');

    // --- State ---
    let ranks = [];
    let stats = [];
    let sidebar = [];
    let extraSections = [];

    // Constants
    const STANDARD_RANKS = [
        // ROW 1
        { title: 'WARLORD', width: '32%', desc: '', members: [] },
        { title: 'QUEEN', width: '32%', desc: '', members: [] },
        { title: 'GENERAL', width: '32%', desc: '', members: [] },
        // ROW 2
        { title: 'GLADIATOR', width: '32%', desc: '', members: [] },
        { title: 'ROYAL CONSORT', width: '32%', desc: '', members: [] },
        { title: 'COUNCILLOR', width: '32%', desc: '', members: [] },
        // ROW 3
        { title: 'MATRIARCH', width: '15%', desc: '', members: [] },
        { title: 'HEIR', width: '15%', desc: '', members: [] },
        { title: 'MARSHAL', width: '15%', desc: '', members: [] },
        { title: 'TRAUMA SPECIALIST', width: '15%', desc: '', members: [] },
        { title: 'MASTER OF ARMS', width: '15%', desc: '', members: [] },
        { title: 'AMBASSADOR', width: '15%', desc: '', members: [] },
        { title: 'SPYMASTER', width: '15%', desc: '', members: [] },
        // ROW 4
        { title: 'LIEUTENANTS', width: '19%', desc: '', members: [] },
        { title: 'COMBAT MEDICS', width: '19%', desc: '', members: [] },
        { title: 'DIPLOMAT', width: '19%', desc: '', members: [] },
        { title: 'STALKERS', width: '19%', desc: '', members: [] },
        { title: 'SHIELDBEARERS', width: '19%', desc: '', members: [] },
        // ROW 5
        { title: 'MEDICS', width: '19%', desc: '', members: [] },
        { title: 'WARRIORS', width: '19%', desc: '', members: [] },
        { title: 'HUNTERS', width: '19%', desc: '', members: [] },
        { title: 'TRADERS', width: '19%', desc: '', members: [] },
        { title: 'WAYFINDER', width: '19%', desc: '', members: [] },
        // ROW 6
        { title: 'YOUNGLINGS', width: '32%', desc: '', members: [] },
        { title: 'APPRENTICE', width: '32%', desc: '', members: [] },
        { title: 'ROYALTY', width: '32%', desc: '', members: [] },
        // ROW 7
        { title: 'SONGBIRDS', width: '49%', desc: '', members: [] },
        { title: 'MISSING', width: '49%', desc: '', members: [] }
    ];

    const DEFAULT_STATS = [
        { title: 'Alignment', value: '', width: '33%' },
        { title: 'Territories', value: '', width: '33%' },
        { title: 'Former Leaders', value: '', width: '33%' }
    ];

    const DEFAULT_SIDEBAR = [
        { title: 'LATEST NEWS', content: '', width: '100%' },
        { title: 'PATROLS', content: '', width: '100%' },
        { title: 'RELATIONS', content: '', width: '100%' }
    ];

    const DEFAULT_EXTRA_SECTIONS = [
        { title: 'CUSTOM SECTION', content: '', width: '100%' }
    ];

    // --- Init ---
    function init() {
        ranks = STANDARD_RANKS.map(r => ({ ...r, id: Date.now() + Math.random(), members: [] }));
        stats = DEFAULT_STATS.map(s => ({ ...s, id: Date.now() + Math.random() }));
        sidebar = DEFAULT_SIDEBAR.map(s => ({ ...s, id: Date.now() + Math.random() }));
        extraSections = []; // Start empty by default or copy default

        renderRankEditor();
        renderStatsEditor();
        renderSidebarEditor();
        renderExtraSectionsEditor();
        setupEventListeners();
        updatePreview();
    }

    function setupEventListeners() {
        form.querySelectorAll('input, textarea, select').forEach(input => {
            input.addEventListener('input', updatePreview);
        });

        // Prevent Enter from submitting the form (which reloads the page)
        // Use delegation to cover dynamic inputs too
        form.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT')) {
                e.preventDefault();
            }
        });

        // Prevent form submission generally
        form.addEventListener('submit', (e) => e.preventDefault());

        const addRankBtn = document.getElementById('add-rank-btn');
        if (addRankBtn) addRankBtn.addEventListener('click', () => { addRank(); });

        const addStatBtn = document.getElementById('add-stat-btn');
        if (addStatBtn) addStatBtn.addEventListener('click', () => { addStat(); });

        const addSidebarBtn = document.getElementById('add-sidebar-btn');
        if (addSidebarBtn) addSidebarBtn.addEventListener('click', () => { addSidebarItem(); });

        const addExtraBtn = document.getElementById('add-extra-btn');
        if (addExtraBtn) addExtraBtn.addEventListener('click', () => { addExtraSection(); });

        const resetStatsBtn = document.getElementById('reset-stats-btn');
        if (resetStatsBtn) resetStatsBtn.addEventListener('click', () => {
            if (confirm('Reset stats to default?')) {
                stats = DEFAULT_STATS.map(s => ({ ...s, id: Date.now() + Math.random() }));
                renderStatsEditor();
                updatePreview();
            }
        });

        const resetSidebarBtn = document.getElementById('reset-sidebar-btn');
        if (resetSidebarBtn) resetSidebarBtn.addEventListener('click', () => {
            if (confirm('Reset sidebar to default?')) {
                sidebar = DEFAULT_SIDEBAR.map(s => ({ ...s, id: Date.now() + Math.random() }));
                renderSidebarEditor();
                updatePreview();
            }
        });

        const resetExtraBtn = document.getElementById('reset-extra-btn');
        if (resetExtraBtn) resetExtraBtn.addEventListener('click', () => {
            if (confirm('Reset extra sections?')) {
                extraSections = [];
                renderExtraSectionsEditor();
                updatePreview();
            }
        });

        const loadStandardBtn = document.getElementById('load-standard-ranks-btn');
        if (loadStandardBtn) loadStandardBtn.addEventListener('click', () => loadStandardRanks(true));

        const fillExampleBtn = document.getElementById('fill-example-btn');
        if (fillExampleBtn) fillExampleBtn.addEventListener('click', fillExampleData);

        const copyBtn = document.getElementById('copy-btn');
        if (copyBtn) copyBtn.addEventListener('click', () => {
            codeOutput.select();
            document.execCommand('copy');
            alert('Code copied!');
        });

        // Expand/Collapse All
        const expandAllBtn = document.getElementById('expand-all-btn');
        const collapseAllBtn = document.getElementById('collapse-all-btn');
        const allSections = document.querySelectorAll('details.form-section');

        if (expandAllBtn) {
            expandAllBtn.addEventListener('click', () => {
                allSections.forEach(section => section.open = true);
            });
        }

        if (collapseAllBtn) {
            collapseAllBtn.addEventListener('click', () => {
                allSections.forEach(section => section.open = false);
            });
        }

        // Toggle Sidebar
        const toggleSidebarBtn = document.getElementById('toggle-sidebar-btn');
        const editorPanel = document.querySelector('.editor-panel');
        if (toggleSidebarBtn && editorPanel) {
            toggleSidebarBtn.addEventListener('click', () => {
                editorPanel.classList.toggle('collapsed');
                // Optional: Adjust icon or title based on state
                toggleSidebarBtn.title = editorPanel.classList.contains('collapsed') ? "Expand Sidebar" : "Minimize Sidebar";
            });
        }

        // Toggle Code Output
        const toggleCodeBtn = document.getElementById('toggle-code-btn');
        const codeSection = document.querySelector('.code-output-section');
        if (toggleCodeBtn && codeSection) {
            toggleCodeBtn.addEventListener('click', () => {
                codeSection.classList.toggle('collapsed');
                toggleCodeBtn.title = codeSection.classList.contains('collapsed') ? "Expand Code" : "Minimize Code";
            });
        }
    }

    // --- Helpers ---
    function loadStandardRanks(confirmAction = true) {
        if (confirmAction && !confirm('This will reset all ranks. Continue?')) return;
        ranks = STANDARD_RANKS.map(r => ({ ...r, id: Date.now() + Math.random(), members: [] }));
        renderRankEditor();
        updatePreview();
    }

    function addRank() {
        ranks.push({ id: Date.now() + Math.random(), title: 'NEW RANK', width: '19%', desc: '', members: [] });
        renderRankEditor();
        updatePreview();
    }

    function addStat() {
        stats.push({ id: Date.now() + Math.random(), title: 'New Stat', value: '', width: '33%' });
        renderStatsEditor();
        updatePreview();
    }

    function addSidebarItem() {
        sidebar.push({ id: Date.now() + Math.random(), title: 'NEW SIDEBAR ITEM', content: '', width: '100%' });
        renderSidebarEditor();
        updatePreview();
    }

    function addExtraSection() {
        extraSections.push({ id: Date.now() + Math.random(), title: 'NEW SECTION', content: '', width: '100%' });
        renderExtraSectionsEditor();
        updatePreview();
    }

    function removeRank(id) {
        if (confirm('Remove this rank?')) {
            ranks = ranks.filter(r => r.id != id);
            renderRankEditor();
            updatePreview();
        }
    }

    function removeStat(id) {
        stats = stats.filter(s => s.id != id);
        renderStatsEditor();
        updatePreview();
    }

    function removeSidebarItem(id) {
        sidebar = sidebar.filter(s => s.id != id);
        renderSidebarEditor();
        updatePreview();
    }

    function removeExtraSection(id) {
        extraSections = extraSections.filter(s => s.id != id);
        renderExtraSectionsEditor();
        updatePreview();
    }

    function addMemberToRank(rankId) {
        const rank = ranks.find(r => r.id == rankId);
        if (rank) {
            rank.members.push({ id: Date.now() + Math.random(), name: '', url: '' });
            renderRankEditor();
            updatePreview();
        }
    }

    function removeMemberFromRank(rankId, memberId) {
        const rank = ranks.find(r => r.id == rankId);
        if (rank) {
            rank.members = rank.members.filter(m => m.id != memberId);
            renderRankEditor();
            updatePreview();
        }
    }

    function updateRankData(id, key, value) {
        const item = ranks.find(r => r.id == id);
        if (item) { item[key] = value; updatePreview(); }
    }

    function updateStatData(id, key, value) {
        const item = stats.find(s => s.id == id);
        if (item) { item[key] = value; updatePreview(); }
    }

    function updateSidebarData(id, key, value) {
        const item = sidebar.find(s => s.id == id);
        if (item) { item[key] = value; updatePreview(); }
    }

    function updateExtraSectionData(id, key, value) {
        const item = extraSections.find(s => s.id == id);
        if (item) { item[key] = value; updatePreview(); }
    }

    function updateMemberData(rankId, memberId, key, value) {
        const rank = ranks.find(r => r.id == rankId);
        if (rank) {
            const member = rank.members.find(m => m.id == memberId);
            if (member) { member[key] = value; updatePreview(); }
        }
    }

    // --- Renderers ---
    function renderStatsEditor() {
        const container = document.getElementById('stats-container');
        if (!container) return;
        container.innerHTML = '';
        stats.forEach(stat => {
            const div = document.createElement('div');
            div.className = 'editor-item';
            div.style.cssText = 'border: 1px solid #444; padding: 10px; margin-bottom: 10px; background: #2a2a2a; border-radius: 5px;';
            div.innerHTML = `
                <div style="display: flex; gap: 10px; margin-bottom: 5px;">
                    <input type="text" value="${stat.title}" oninput="updateStatData('${stat.id}', 'title', this.value)" style="font-weight: bold; flex: 1;" placeholder="Stat Title">
                    <select onchange="updateStatData('${stat.id}', 'width', this.value)" style="width: 80px;">
                        <option value="100%" ${stat.width === '100%' ? 'selected' : ''}>100%</option>
                        <option value="50%" ${stat.width === '50%' ? 'selected' : ''}>50%</option>
                        <option value="33%" ${stat.width === '33%' ? 'selected' : ''}>33%</option>
                        <option value="25%" ${stat.width === '25%' ? 'selected' : ''}>25%</option>
                    </select>
                    <button onclick="removeStat('${stat.id}')" style="background: #e74c3c; color: #fff; border: none; padding: 5px; cursor: pointer;">X</button>
                </div>
                <input type="text" value="${stat.value}" oninput="updateStatData('${stat.id}', 'value', this.value)" placeholder="Value" style="width: 100%;">
             `;
            container.appendChild(div);
        });
        window.updateStatData = updateStatData;
        window.removeStat = removeStat;
    }

    function renderSidebarEditor() {
        const container = document.getElementById('sidebar-container');
        if (!container) return;
        container.innerHTML = '';
        sidebar.forEach(item => {
            const div = document.createElement('div');
            div.className = 'editor-item';
            div.style.cssText = 'border: 1px solid #444; padding: 10px; margin-bottom: 10px; background: #2a2a2a; border-radius: 5px;';
            div.innerHTML = `
                <div style="display: flex; gap: 10px; margin-bottom: 5px;">
                    <input type="text" value="${item.title}" oninput="updateSidebarData('${item.id}', 'title', this.value)" style="font-weight: bold; flex: 1;" placeholder="Title">
                     <select onchange="updateSidebarData('${item.id}', 'width', this.value)" style="width: 80px;">
                        <option value="100%" ${item.width === '100%' ? 'selected' : ''}>100%</option>
                        <option value="50%" ${item.width === '50%' ? 'selected' : ''}>50%</option>
                    </select>
                    <button onclick="removeSidebarItem('${item.id}')" style="background: #e74c3c; color: #fff; border: none; padding: 5px; cursor: pointer;">X</button>
                </div>
                <textarea oninput="updateSidebarData('${item.id}', 'content', this.value)" style="width: 100%; height: 60px;" placeholder="Content...">${item.content || ''}</textarea>
             `;
            container.appendChild(div);
        });
        window.updateSidebarData = updateSidebarData;
        window.removeSidebarItem = removeSidebarItem;
    }

    function renderExtraSectionsEditor() {
        const container = document.getElementById('extra-sections-container');
        if (!container) return;
        container.innerHTML = '';
        extraSections.forEach(item => {
            const div = document.createElement('div');
            div.className = 'editor-item';
            div.style.cssText = 'border: 1px solid #444; padding: 10px; margin-bottom: 10px; background: #2a2a2a; border-radius: 5px;';
            div.innerHTML = `
                <div style="display: flex; gap: 10px; margin-bottom: 5px;">
                    <input type="text" value="${item.title}" oninput="updateExtraSectionData('${item.id}', 'title', this.value)" style="font-weight: bold; flex: 1;" placeholder="Title">
                     <select onchange="updateExtraSectionData('${item.id}', 'width', this.value)" style="width: 80px;">
                        <option value="100%" ${item.width === '100%' ? 'selected' : ''}>100%</option>
                        <option value="50%" ${item.width === '50%' ? 'selected' : ''}>50%</option>
                    </select>
                    <button onclick="removeExtraSection('${item.id}')" style="background: #e74c3c; color: #fff; border: none; padding: 5px; cursor: pointer;">X</button>
                </div>
                <textarea oninput="updateExtraSectionData('${item.id}', 'content', this.value)" style="width: 100%; height: 60px;" placeholder="Content...">${item.content || ''}</textarea>
             `;
            container.appendChild(div);
        });
        window.updateExtraSectionData = updateExtraSectionData;
        window.removeExtraSection = removeExtraSection;
    }

    function renderRankEditor() {
        const container = document.getElementById('ranks-container');
        if (!container) return;
        container.innerHTML = '';

        ranks.forEach((rank, index) => {
            const details = document.createElement('details');
            details.className = 'rank-editor-item';
            // Open first few by default, close rest
            if (index < 3) details.open = true;

            details.style.cssText = 'border: 1px solid #444; margin-bottom: 10px; background: #2a2a2a; border-radius: 5px; overflow: hidden;';

            const membersHTML = rank.members.map(m => `
                <div class="member-row" style="display: flex; gap: 5px; margin-top: 5px;">
                    <input type="text" placeholder="Name" value="${m.name}" oninput="updateMemberData('${rank.id}', '${m.id}', 'name', this.value)" style="flex: 1; min-width: 0;">
                    <input type="text" placeholder="URL" value="${m.url}" oninput="updateMemberData('${rank.id}', '${m.id}', 'url', this.value)" style="flex: 1; min-width: 0;">
                    <button onclick="removeMemberFromRank('${rank.id}', '${m.id}')" style="background: #e74c3c; color: white; border: none; padding: 5px 10px; font-size: 11px; cursor: pointer; border-radius: 3px; flex-shrink: 0; min-width: 25px;">X</button>
                </div>
            `).join('');

            details.innerHTML = `
                <summary style="padding: 10px; background: #333; cursor: pointer; display: flex; justify-content: space-between; align-items: center; list-style: none;">
                    <span style="font-weight: bold; color: #eee; font-family: 'Dosis', sans-serif; text-transform: uppercase;">${rank.title || 'UNTITLED'} <span style="font-size: 0.8em; color: #888;">(${rank.width})</span></span>
                    <button onclick="event.preventDefault(); removeRank('${rank.id}')" style="background: #e74c3c; color: #fff; border: none; padding: 2px 8px; border-radius: 3px; font-size: 12px; cursor: pointer;">REMOVE</button>
                </summary>
                
                <div style="padding: 10px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                        <input type="text" value="${rank.title}" oninput="updateRankData('${rank.id}', 'title', this.value)" style="font-weight: bold; width: 100%;" placeholder="Rank Title">
                    </div>
                
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px;">
                        <div>
                            <label style="font-size: 12px; display: block; margin-bottom: 3px;">Width / Items per Row</label>
                            <select onchange="updateRankData('${rank.id}', 'width', this.value)" style="width: 100%; padding: 5px;">
                                <option value="100%" ${rank.width === '100%' ? 'selected' : ''}>100% (1 per row)</option>
                                <option value="49%" ${rank.width === '49%' ? 'selected' : ''}>49% (2 per row)</option>
                                <option value="32%" ${rank.width === '32%' ? 'selected' : ''}>32% (3 per row)</option>
                                <option value="24%" ${rank.width === '24%' ? 'selected' : ''}>24% (4 per row)</option>
                                <option value="19%" ${rank.width === '19%' ? 'selected' : ''}>19% (5 per row)</option>
                                <option value="15%" ${rank.width === '15%' ? 'selected' : ''}>15% (6 per row)</option>
                            </select>
                        </div>
                        <div>
                            <label style="font-size: 12px; display: block; margin-bottom: 3px;">Description (Optional)</label>
                            <textarea oninput="updateRankData('${rank.id}', 'desc', this.value)" style="width: 100%; padding: 5px; height: 30px; resize: vertical;" placeholder="Brief description...">${rank.desc || ''}</textarea>
                        </div>
                    </div>

                    <div class="members-list">
                        <label style="font-size: 12px; font-weight: bold;">MEMBERS</label>
                        ${membersHTML}
                        <button onclick="addMemberToRank('${rank.id}')" style="width: 100%; margin-top: 5px; background: #444; color: #ccc; border: 1px dashed #666; padding: 5px; cursor: pointer;">+ Add Member</button>
                    </div>
                </div>
            `;
            container.appendChild(details);
        });

        window.removeRank = removeRank;
        window.updateRankData = updateRankData;
        window.addMemberToRank = addMemberToRank;
        window.removeMemberFromRank = removeMemberFromRank;
        window.updateMemberData = updateMemberData;
    }

    // --- Fill Example ---
    function fillExampleData() {
        document.getElementById('packName').value = 'The Nightwatch';
        document.getElementById('packSlogan').value = 'Night gathers, and now my watch begins.';
        document.getElementById('packBanner').value = 'https://i.ibb.co/NnQkhs8M/image.png';
        document.getElementById('packQuote').value = 'I am the sword in the darkness.';
        document.getElementById('headerBgImage').value = 'https://i.imgur.com/krZJzYo.png'; // Default header BG
        document.getElementById('rankHeaderBgImage').value = 'https://i.imgur.com/krZJzYo.png'; // Default rank header BG
        // Inner Settings
        document.getElementById('textureOverlay').value = 'https://www.transparenttextures.com/patterns/dark-matter.png';
        document.getElementById('innerBgImage').value = 'https://i.imgur.com/krZJzYo.png';
        document.getElementById('bgColor').value = '#000000';
        document.getElementById('textColor').value = '#aaaaaa';
        document.getElementById('linkColor').value = '#b8eeff';

        // Opacities
        document.getElementById('loreBgOpacity').value = 0.7;
        document.getElementById('sidebarBgOpacity').value = 0.7;
        document.getElementById('extraBgOpacity').value = 0.7;

        // Stats
        stats = [
            { id: 's1', title: 'Alignment', value: 'Lawful Neutral', width: '33%' },
            { id: 's2', title: 'Territories', value: 'The Wall, The Gift', width: '33%' },
            { id: 's3', title: 'Lord Commander', value: 'Jeor Mormont', width: '33%' },
            { id: 's4', title: 'Founded', value: 'Age of Heroes', width: '100%' }
        ];

        document.getElementById('packDesc').value = 'The Nightwatch is a military order dedicated to holding the Wall, the immense ice fortification on the northern border of the Seven Kingdoms, defending the realms of men from what lies beyond.';
        document.getElementById('packHistory').value = 'For thousands of years, the Nightwatch has stood guard. Though their numbers have dwindled and their castles crumbled, their purpose remains the same.';
        document.getElementById('packRules').value = '1. Wear no crowns.\n2. Win no glory.\n3. Take no wife, hold no lands, father no children.';
        document.getElementById('packTerritoryInfo').value = 'A frozen wasteland of ice and snow beyond the Wall, home to wildlings and worse.';

        // Sidebar
        sidebar = [
            { id: 'sb1', title: 'LATEST NEWS', content: 'Reports of white walkers seen near Craster\'s Keep.', width: '100%' },
            { id: 'sb2', title: 'PATROLS', content: 'Rangers range beyond the wall.', width: '100%' },
            { id: 'sb3', title: 'RELATIONS', content: 'Wildlings: Hostile\nStarks: Allies', width: '100%' }
        ];

        // Extra Sections (Main Column)
        extraSections = [
            { id: 'ex1', title: 'TRADITIONS', content: 'We hold no lands, wear no crowns.', width: '100%' },
            { id: 'ex2', title: 'NOTABLE RELICS', content: 'Longclaw: Valyrian steel sword of House Mormont.', width: '100%' }
        ];

        // Ranks - Generating Full Nightwatch Roster based on STANDARD_RANKS structure
        const nightwatchTitles = [
            // Row 1
            "Lord Commander", "Maester", "First Ranger",
            // Row 2
            "First Builder", "First Steward", "Recruiter",
            // Row 3
            "Watch Commander", "Master of Arms", "Qhorin Halfhand", "Yoren", "Dolorous Edd", "Grenn", "Pyp",
            // Row 4
            "Senior Rangers", "Senior Builders", "Senior Stewards", "Eastwatch Guard", "Shadow Tower Scout",
            // Row 5
            "Rangers", "Builders", "Stewards", "Mole's Town Trader", "Wall Sniper",
            // Row 6
            "Recruits", "Stable Boys", "Cooks",
            // Row 7
            "Deserters", "Missing"
        ];

        const nightwatchDescriptions = {
            "Lord Commander": "Supreme authority on the Wall, elected for life by the brothers.",
            "Maester": "Advisor, healer, and scholar for the Night's Watch.",
            "First Ranger": "Leader of the rangers who patrol the Haunted Forest.",
            "First Builder": "Oversees the maintenance and reinforcement of the Wall.",
            "First Steward": "Manages logistics, supplies, and food for the Watch.",
            "Recruiter": "Wandering crows who bring new recruits to the Wall.",
            "Watch Commander": "Commanding officers of the various castles along the Wall.",
            "Master of Arms": "Responsible for training recruits in the art of combat.",
            "Qhorin Halfhand": "A legendary ranger stationed at the Shadow Tower.",
            "Yoren": "A veteran recruiter who scours the Seven Kingdoms for men.",
            "Dolorous Edd": "A steward known for his dry wit and constant pessimism.",
            "Grenn": "A strong and loyal ranger, one of Jon Snow's closest allies.",
            "Pyp": "A quick-witted ranger with a talent for mimicry.",
            "Senior Rangers": "Veteran woodsmen who have survived many moons beyond the Wall.",
            "Senior Builders": "Expert stonemasons and engineers of the Night's Watch.",
            "Senior Stewards": "Experienced attendants to the Watch's leadership.",
            "Eastwatch Guard": "Sentinels guarding the Wall's eastern seaside fortress.",
            "Shadow Tower Scout": "Elite scouts based at the western end of the Wall.",
            "Rangers": "The primary fighting and scouting force beyond the Wall.",
            "Builders": "The workforce tasked with repairing the Wall and its castles.",
            "Stewards": "The support staff responsible for day-to-day operations.",
            "Mole's Town Trader": "Local liaisons who manage trade with the nearby village.",
            "Wall Sniper": "Archers trained to defend the parapets from vertical assault.",
            "Recruits": "Men in training who have yet to take their final vows.",
            "Stable Boys": "Youthful brothers tasked with the care of the Watch's horses.",
            "Cooks": "The essential crew responsible for feeding the hungry brothers.",
            "Deserters": "Those who have broken their sacred vows and fled into the night.",
            "Missing": "Brothers who have vanished into the cold beyond the Wall."
        };

        const nightwatchMembers = {
            "Lord Commander": ["Jeor Mormont"],
            "Maester": ["Aemon Targaryen"],
            "First Ranger": ["Benjen Stark"],
            "First Builder": ["Othell Yarwyck"],
            "First Steward": ["Bowen Marsh"],
            "Recruiter": ["Yoren"],
            "Rangers": ["Grenn", "Pyp", "Eddison Tollett"],
            "Builders": ["Halder", "Albett"],
            "Stewards": ["Samwell Tarly", "Chett"],
            "Recruits": ["Jon Snow", "Rast"],
            "Deserters": ["Gared"],
            "Missing": ["Will"]
        };

        ranks = STANDARD_RANKS.map((stdRank, index) => {
            const title = nightwatchTitles[index] || stdRank.title; // Fallback if list is short

            // Populate Members if we have data for this title, or just generic if it matches a key
            let members = [];
            // Check direct title match or partial match
            const memberNames = nightwatchMembers[title] || [];

            members = memberNames.map(name => ({
                id: Date.now() + Math.random() + Math.random(), // Ensure unique ID
                name: name,
                url: '#'
            }));

            // Special case for Jon Snow if not mapped
            if (title === "Recruits" && members.length === 0) {
                members.push({ id: 'm_jon', name: 'Jon Snow', url: '#' });
            }

            return {
                id: 'r_ex_' + index,
                title: title,
                width: stdRank.width,
                desc: nightwatchDescriptions[title] || stdRank.desc,
                members: members
            };
        });

        renderStatsEditor();
        renderSidebarEditor();
        renderExtraSectionsEditor();
        renderRankEditor();
        updatePreview();
    }

    // --- Generate HTML ---
    function generateHTML(data, ranksData) {
        const hFont = data.headingFont || "'Dosis', sans-serif";
        const bFont = data.bodyFont || "'Luxurious Roman', serif";
        const baseSize = data.baseSize + 'px';
        const scale = parseFloat(data.headingScale) || 1.0;

        // Stats
        const statsHTML = stats.map(stat => `
        <div style="width: ${stat.width}; padding: 20px; border-right: 1px solid #222; text-align: center; box-sizing: border-box;">
             <h2 style="font-family: ${hFont}; color: ${data.accentColor}; font-size: ${18 * scale}px; margin-bottom: 10px; text-transform: uppercase;">${stat.title}</h2>
             <div style="font-family: ${bFont}; font-size: ${parseInt(data.baseSize) - 1}px; color: ${data.textColor || '#ccc'};">${stat.value || '-'}</div>
        </div>
        `).join('');

        // Helper for background color
        const getBgStyle = (enabled, color, opacity) => {
            if (!enabled) return 'transparent';
            let r = 0, g = 0, b = 0;
            if (color && color.length === 7) {
                r = parseInt(color.slice(1, 3), 16);
                g = parseInt(color.slice(3, 5), 16);
                b = parseInt(color.slice(5, 7), 16);
            }
            return `rgba(${r}, ${g}, ${b}, ${opacity})`;
        };

        const sidebarBg = getBgStyle(data.sidebarBgEnabled, data.sidebarBgColor, data.sidebarBgOpacity);
        const extraBg = getBgStyle(data.extraBgEnabled, data.extraBgColor, data.extraBgOpacity);
        const loreBg = getBgStyle(data.loreBgEnabled, data.loreBgColor, data.loreBgOpacity);

        // Sidebar (Right Column)
        const sidebarHTML = sidebar.map(item => `
        <div style="width: ${item.width}; padding: ${item.width === '100%' ? '20px' : '10px'}; border: ${data.sidebarBgEnabled ? '1px solid #222' : 'none'}; margin-bottom: 20px; background: ${sidebarBg}; box-sizing: border-box; display: inline-block; vertical-align: top;">
             <h3 style="font-family: ${hFont}; color: ${data.accentColor}; font-size: ${18 * scale}px; text-align: center; margin-bottom: 15px; border-bottom: 1px solid #333; padding-bottom: 5px; text-transform: uppercase;">${item.title}</h3>
             <div style="font-family: ${bFont}; font-size: ${parseInt(data.baseSize) - 2}px; color: ${data.textColor || '#999'};">${item.content ? item.content.replace(/\n/g, '<br>') : ''}</div>
        </div>
        `).join('');

        // Extra Sections (Main Column)
        const extraSectionsHTML = extraSections.map(item => `
        <div style="width: ${item.width}; padding: ${data.extraBgEnabled ? (item.width === '100%' ? '20px' : '10px') : '0 10px'}; margin-bottom: 20px; box-sizing: border-box; background: ${extraBg}; border: ${data.extraBgEnabled ? '1px solid #222' : 'none'};">
             <h3 style="font-family: ${hFont}; color: ${data.accentColor}; font-size: ${18 * scale}px; border-bottom: 1px solid #333; padding-bottom: 5px; text-transform: uppercase; margin-bottom: 10px;">${item.title}</h3>
             <div style="font-family: ${bFont}; font-size: ${baseSize}; color: ${data.textColor || '#aaa'}; line-height: 1.4;">${item.content ? item.content.replace(/\n/g, '<br>') : ''}</div>
        </div>
        `).join('');

        // Ranks
        const ranksHTML = ranksData.map(rank => {
            const memberList = rank.members.map(m => `
                <div style="margin: 5px 0;">
                    <a href="${m.url || '#'}" style="color: ${data.linkColor || '#b8eeff'}; text-decoration: none; font-weight: bold; font-family: ${hFont}; font-size: ${parseInt(data.baseSize) - 1}px; letter-spacing: 1px; text-transform: uppercase;">${m.name || 'Unknown'}</a>
                </div>
            `).join('');

            return `
        <details style="margin-bottom: 5px; width: ${rank.width}; vertical-align: top; display: inline-block;">
            <summary class="thead" style="padding: 10px; background-image: url('${data.rankHeaderBgImage || 'https://i.imgur.com/krZJzYo.png'}'); background-size: cover; border: 1px solid #000; color: #fff; text-align: center; font-family: ${hFont}; letter-spacing: 2px; cursor: pointer; font-size: ${12 * scale}px;">${rank.title.toUpperCase()}</summary>
            <div style="background-color: rgba(24, 34, 51, 0.8); padding: 15px; text-align: center; border: 1px solid #000; border-top: none; min-height: 50px;">
                ${rank.desc ? `<div style="font-size: ${parseInt(data.baseSize) - 4}px; font-style: italic; margin-bottom: 10px; color: #ccc;">${rank.desc}</div>` : ''}
                ${memberList || '<i style="opacity:0.5; font-size: 12px;">Open</i>'}
            </div>
        </details>`;
        }).join('');

        const createContentBlock = (title, content) => {
            if (!content) return '';
            return `<b style="font-size: ${16 * scale}px; color: ${data.accentColor}; font-family: ${hFont}; text-transform: uppercase; border-bottom: 1px solid ${data.accentColor}; display: block; margin-bottom: 5px;">${title}</b>
             <div style="margin-bottom: 15px;">${content.replace(/\n/g, '<br>')}</div>`;
        };

        return `
<!-- FULL PAGE BACKGROUND -->
<div style="width: 100%; min-height: 100vh; padding: 50px 0; box-sizing: border-box; background-color: #0d0d0d; background-image: ${data.innerBgImage ? `url('${data.innerBgImage}')` : 'none'}; background-size: cover; background-attachment: fixed; background-position: center center;">

    <!-- FONT IMPORT (Included for portability) -->
    <link href="https://fonts.googleapis.com/css2?family=Anton&family=Bangers&family=Cinzel:wght@400;700&family=Dancing+Script:wght@400;700&family=Fira+Code&family=Lato:wght@400;700&family=Merriweather:wght@300;400;700&family=Montserrat:wght@400;700&family=Open+Sans:wght@400;700&family=Oswald:wght@400;700&family=Pacifico&family=Playfair+Display:wght@400;700&family=Roboto:wght@400;700&family=Satisfy&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">

    <!-- PACK CONTAINER -->
    <div style="background-color: rgba(0,0,0,0); max-width: 1100px; margin: 0 auto; border: 1px solid #000; box-shadow: 0 0 20px #000;">

    <!-- HEADER -->
    <div class="thead packbanner" style="background-image: url('${data.headerBgImage || 'https://i.imgur.com/krZJzYo.png'}'); background-size: 100% 100%; background-position: 50% 50%; background-repeat: no-repeat; padding: 50px 20px; text-align: center; border-bottom: 5px solid #141414; box-shadow: inset 0 0 50px #000;">
        <h1 style="font-family: ${hFont}; font-size: ${60 * scale}px; color: #fff; text-shadow: 3px 3px 5px #000; margin: 0; text-transform: uppercase; letter-spacing: 5px;">${data.name || 'PACK NAME'}</h1>
        <h2 style="font-family: ${hFont}; font-size: ${14 * scale}px; color: #eee; text-shadow: 1px 1px 2px #000; font-weight: normal; margin-top: 10px; letter-spacing: 2px; text-transform: uppercase;">${data.slogan || ''}</h2>
        ${data.quote ? `<div style="font-family: ${bFont}; font-size: ${baseSize}; margin-top: 15px; color: #ccc;">"${data.quote}"</div>` : ''}
    </div>

    <!-- STATS ROW -->
    <div style="display: flex; flex-wrap: wrap; background: #111; border-bottom: 1px solid #222;">
        ${statsHTML}
    </div>

    <!-- MAIN BODY -->
    <div style="padding: 40px; background-color: ${data.innerBgImage ? 'rgba(0,0,0,0)' : data.bgColor}; background-image: ${data.textureOverlay ? `url('${data.textureOverlay}')` : 'none'}; background-size: auto; background-repeat: repeat; position: relative;">
        ${data.banner ? `
        <div style="text-align: center; margin-bottom: 30px;">
            <img src="${data.banner}" style="max-width: 100%; border: 5px solid #111;">
        </div>` : ''}

        <div style="display: flex; gap: 40px; flex-wrap: wrap;">
            <!-- LEFT -->
            <div style="flex: 2; min-width: 500px; padding: ${data.loreBgEnabled ? '20px' : '0'}; background: ${loreBg}; border: ${data.loreBgEnabled ? '1px solid #222' : 'none'}; box-sizing: border-box;">
                <div style="font-family: ${bFont}; font-size: ${baseSize}; line-height: 1.6; color: ${data.textColor || '#aaa'}; text-align: justify;">
                    ${createContentBlock('Description & Culture', data.desc)}
                    ${createContentBlock('History', data.history)}
                    ${createContentBlock('Laws & Rules', data.rules)}
                    ${createContentBlock('Territory Info', data.territoryInfo)}
                </div>
            </div>
            <div style="flex: 1; min-width: 300px; font-size: 0;">
                ${sidebarHTML}
            </div>
        </div>

        <!-- EXTRAS (Full Width Below Sidebar) -->
        <div style="display: flex; flex-wrap: wrap; margin-top: 40px;">
            ${extraSectionsHTML}
        </div>

        <!-- RANKS -->
        <div style="margin-top: 50px; text-align: center;">
            <h1 style="font-family: ${hFont}; color: #fff; text-shadow: 2px 2px 4px #000; letter-spacing: 5px; font-size: ${36 * scale}px; margin-bottom: 20px;">PACK RANKS</h1>
            <div style="font-size: 0;">
                ${ranksHTML}
            </div>
        </div>

    </div>
</div>
<!-- FOOTER -->
<div style="text-align: center; padding: 10px; font-size: 10px; color: #444; font-family: sans-serif;">Generated by Ardent Pack Builder</div>
</div>`.trim();
    }

    function updatePreview() {
        const data = {
            name: document.getElementById('packName').value,
            slogan: document.getElementById('packSlogan').value,
            banner: document.getElementById('packBanner').value,
            quote: document.getElementById('packQuote').value,

            // Note: Stats, Sidebar, Ranks are handled by global arrays now

            desc: document.getElementById('packDesc').value,
            history: document.getElementById('packHistory').value,
            rules: document.getElementById('packRules').value,
            territoryInfo: document.getElementById('packTerritoryInfo').value,

            bgColor: document.getElementById('bgColor').value,
            accentColor: document.getElementById('accentColor').value,
            textColor: document.getElementById('textColor').value,
            linkColor: document.getElementById('linkColor').value,
            headerBgImage: document.getElementById('headerBgImage').value,
            rankHeaderBgImage: document.getElementById('rankHeaderBgImage').value,
            innerBgImage: document.getElementById('innerBgImage').value,
            textureOverlay: document.getElementById('textureOverlay').value,

            // Typography
            headingFont: document.getElementById('fontHeadings').value,
            bodyFont: document.getElementById('fontBody').value,
            baseSize: document.getElementById('sizeBase').value || 15,
            headingScale: document.getElementById('sizeHeadings').value || 1.0,

            // Section Styling
            sidebarBgEnabled: document.getElementById('sidebarBgEnabled').checked,
            sidebarBgColor: document.getElementById('sidebarBgColor').value,
            sidebarBgOpacity: document.getElementById('sidebarBgOpacity').value,
            extraBgEnabled: document.getElementById('extraBgEnabled').checked,
            extraBgColor: document.getElementById('extraBgColor').value,
            extraBgOpacity: document.getElementById('extraBgOpacity').value,
            loreBgEnabled: document.getElementById('loreBgEnabled').checked,
            loreBgColor: document.getElementById('loreBgColor').value,
            loreBgOpacity: document.getElementById('loreBgOpacity').value
        };

        const html = generateHTML(data, ranks);
        previewBox.innerHTML = html;
        codeOutput.value = html;
        previewBox.style.backgroundColor = data.bgColor;
    }

    init();
});
