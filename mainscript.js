const addCreatureButton = document.querySelector('.add-creature');
const creaturePopup = document.querySelector('.creature-popup');

const creatureName = document.querySelector('.creature-name');

const saveButton = document.querySelector('.save-stats');
const typeDMGButton = document.querySelector('.type-damage');
const statsContainer = document.querySelector('#stats');
const arrValueNames = ['stat-value', 'stat-bonus', 'incoming-damage-value', 'percentage-dmg-value', 'percentage-dmg-label'];

let currentCreatureId = null;
const data = JSON.parse(localStorage.getItem('creatures')) || {};
localStorage.setItem('creatures', JSON.stringify(data));

const creatureList = document.querySelector('.creature-list');

function fitText(input) {
    let size = input.classList.contains('stat-bonus') ? 16 : 24;

    input.style.fontSize = size + 'px'; 
    while (input.scrollWidth > input.clientWidth && size > 12) {
        size -= 0.5;
        input.style.fontSize = size + 'px';
    }

    if (input.classList.contains('percentage-dmg-label')) {
        const label = input.parentElement.querySelector('.percentage-dmg-label');
       if (label) {
        size *= 0.8;
        label.style.fontSize = size + 'px';
       }
    }
}

document.addEventListener('input', (event) => {
    if (arrValueNames.some(cls => event.target.classList.contains(cls))) {
        fitText(event.target);
    }
});

document.querySelectorAll('.stat-value, .stat-bonus, .incoming-damage-value, .percentage-dmg-value, .percentage-dmg-label').forEach(fitText);

addCreatureButton.addEventListener('click', () => {
    creaturePopup.hidden = !creaturePopup.hidden;
    document.querySelector('.new-popup').hidden = true; 
    document.querySelector('.load-popup').hidden = true; 
});

creaturePopup.addEventListener('click', (event) => {
    const action = event.target.dataset.action;
    const loadPopUp = document.querySelector('.load-popup');
    const newPopUp = document.querySelector('.new-popup');
    if (action === 'new') {
        loadPopUp.hidden = true;
        newPopUp.hidden = !newPopUp.hidden; 
    } else if (action === 'load') {
        newPopUp.hidden = true;
        loadPopUp.hidden = !loadPopUp.hidden; 
        if (!loadPopUp.hidden) {
            creatureList.innerHTML = '';
            Object.entries(data).forEach(([id, creature]) => {
                const container = document.querySelector('.creature-container');
                
                const button = document.createElement('button');
                button.className = 'creature';

                const label = document.createElement('span');
                label.textContent = creature.name;

                const close = document.createElement('span');
                    close.className = 'creature-close';
                    close.textContent = '\u00D7';
                    close.addEventListener('click', (event) => {
                        event.stopPropagation();
                        delete data[id];
                        localStorage.setItem('creatures', JSON.stringify(data));
                        button.remove();
                        
                        if (currentCreatureId === id) { 
                            currentCreatureId = null;
                        }
                    });
                
                button.addEventListener('click', () => {
                    const headerButton = document.createElement('button');
                    headerButton.className = 'creature';

                    const label = document.createElement('span');
                    label.textContent = creature.name;

                    const close = document.createElement('span');
                    close.className = 'creature-close';
                    close.textContent = '\u00D7';
                    close.addEventListener('click', (event) => {
                        event.stopPropagation();
                        headerButton.remove();
                });

                    headerButton.append(label, close);
                    headerButton.addEventListener('click', () => loadCreature(id));
                    
                    container.appendChild(headerButton);
            });
                button.append(label, close);
                creatureList.appendChild(button);
            });
        }
    }
});

document.addEventListener('click', (event) => {
    if (!event.target.closest('.creature-container')) {
        creaturePopup.hidden = true;
        document.querySelector('.new-popup').hidden = true; 
    }
});

function readStats() {
    const stats = {};
    document.querySelectorAll('.stat-row').forEach((row) => {
        const valueInput = row.querySelector('.stat-value');
        const statName = valueInput.id.replace('-value', '');
        stats[statName] = { value: Number(valueInput.value) };
    });
    return stats; 
}

function applyStats(stats) {
    document.querySelectorAll('.stat-row').forEach((row) => {
        const valueInput = row.querySelector('.stat-value');
        const statName = valueInput.id.replace('-value', '');
        const saved = stats[statName];
        if (saved) {
            valueInput.value = saved.value;
            fitText(valueInput);
        }
    });
}

saveButton.addEventListener('click', (event) => {
    if (!currentCreatureId) return;
    const all = JSON.parse(localStorage.getItem('creatures')) || {};

    if (!all[currentCreatureId]) return;
    all[currentCreatureId].stats = readStats();    // overwrite this creature's stats
    localStorage.setItem('creatures', JSON.stringify(all));
});

function createCreature(name) {
    const id = crypto.randomUUID();
    currentCreatureId = id;

    document.querySelectorAll('.stat-value').forEach((input) => {
        input.value = 0;                 // fresh blank stats
    });    
    
    const all = JSON.parse(localStorage.getItem('creatures')) || {};
    all[id] = { name, stats: readStats() };
    localStorage.setItem('creatures', JSON.stringify(all));
    return id;
}

function loadCreature(id) {
    const all = JSON.parse(localStorage.getItem('creatures')) || {};
    const creature = all[id];
    if (!creature) return;
    currentCreatureId = id;
    applyStats(creature.stats);
}

creatureName.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        const name = creatureName.value.trim(); 
        if (name === '') {
            return;
        }

        // Creating the Creature button
        const button = document.createElement('button');
        button.className = 'creature';
        
        const label = document.createElement('span');
        label.textContent = name;

        const close = document.createElement('span');
        close.className = 'creature-close';
        close.textContent = '\u00D7';
        close.addEventListener('click', (event) => {
            event.stopPropagation();
            button.remove();
        });

        button.append(label, close);

        const container = document.querySelector('.creature-container');
        container.appendChild(button);

        creatureName.value = '';        
        document.querySelector('.new-popup').hidden = true; 

        const id = createCreature(name);
        button.addEventListener('click', () => loadCreature(id));
    }
});

typeDMGButton.dataset.mode = 'physical';
typeDMGButton.textContent = 'Physical';

typeDMGButton.addEventListener('click', () => {
    const isPhysical = typeDMGButton.dataset.mode === 'physical';
    typeDMGButton.dataset.mode = isPhysical ? 'magic' : 'physical';
    typeDMGButton.textContent = isPhysical ? 'Magic' : 'Physical';
    resultContainer.style.borderColor = isPhysical ? '#00FFFF' : '#ff0000';
});

const resultContainer = document.querySelector('.result-container');
const calculateButton = document.querySelector('.calculate-damage');

function calcDMG() {
    const stats = {};
    const statNames = ['defense', 'resistance', 'attack', 'magic'];

    statNames.forEach((name) => {
        const value = Number(document.querySelector(`#${name}-value`).value) || 0; 
        const bonus = Number(document.querySelector(`#${name}-bonus`).value) || 0;
        stats[name] = value * (1 + bonus / 100);
    });

    const incomingDamageValue = Number(document.querySelector('.incoming-damage-value').value) || 0;
    const percentageDmgValue = Number(document.querySelector('.percentage-dmg-value').value) || 0;
    
    const attackResult = stats.attack * (percentageDmgValue / 100);
    const magicResult = stats.magic * (percentageDmgValue / 100);

    const resistanceTaken = Math.max(0, stats.resistance - incomingDamageValue);
    const defenseTaken = Math.max(0, stats.defense - incomingDamageValue);

    const isPhysical = document.querySelector('.type-damage').textContent.trim() === 'Physical';
    const label = isPhysical ? 'Physical Damage' : 'Magic Damage';
    const value = isPhysical ? attackResult : magicResult;
    const taken = isPhysical ? defenseTaken : resistanceTaken;

    resultContainer.innerHTML = `
        <div class="result-row">
            <span class="result-label">${label}:</span>
            <span class="result-value">${Math.floor(value)}</span>
        </div>
        <div class="result-row">
            <span class="result-label">Damage Taken:</span>
            <span class="result-value">${Math.floor(taken)}</span>
        </div>`;
}

calculateButton.addEventListener('click', calcDMG);