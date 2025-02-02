/* theme */
let darkMode = (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) || false;
updateTheme();

// to-do: remember theme value, especially if we are going to have multiple pages
function updateTheme() {
    document.body.dataset.theme = (darkMode ? 'dark' : 'light');
    if (document.querySelector('#theme-switch').checked != darkMode) document.querySelector('#theme-switch').checked = darkMode;
}

document.querySelector('#theme-switch').addEventListener('change', e => {
    darkMode = e.target.checked;
    updateTheme();
});

/* counters */ 
const options = {
    duration: 0.5,
    separator: ' ',
};

let memberCounter;
let messageCounter;

function updateCounters() {
    if (document.hasFocus() || !memberCounter || !messageCounter) {
        //console.log('Updating...')
        fetch('https://koira.testausserveri.fi/api/guildInfo')
        .then((res) => res.json())
        .then(data => {
            if (!memberCounter || !messageCounter) {
                memberCounter = new countUp.CountUp('memberCount', data.memberCount, options);
                messageCounter = new countUp.CountUp('messageCount', data.messagesToday, options);
                memberCounter.start();
                messageCounter.start();
            }
            memberCounter.update(data.memberCount);
            messageCounter.update(data.messagesToday);
        })
    } else {
        //console.log('Tab not focused, not updating...');
    }
}
updateCounters();
window.addEventListener('focus', () => {
    setTimeout(updateCounters, 500);
});
setInterval(updateCounters, 5100);

/* projects */
class Grid {
    constructor(data, selector) {
        this.data = data;
        this.target = document.querySelector(selector);
        this.render();
    }
    render() {
        this.data.forEach((item, i) => {
            let domItem;
            if (item.url) {
                domItem = document.createElement('a');
                domItem.href = item.url + '?utm_source=testausserveri&utm_medium=homepage&utm_campaign=projects'; // append some analytic magic
                domItem.setAttribute('rel', 'noopener noreferrer');
                domItem.setAttribute('target', '_blank');
            } else {
                domItem = document.createElement('div');
            }
    
            domItem.className = 'item';
    
            if (item.video) {
                let domBackground = document.createElement('video');
                domBackground.setAttribute('poster', item.image);
                domBackground.autoplay = true;
                domBackground.loop = true;
                domBackground.muted = true;
                domBackground.setAttribute('playsinline', '');
                domBackground.className = 'itemBackground';
                domBackground.id = 'bg' + i;
                let domBackgroundSource = document.createElement('source');
                domBackgroundSource.setAttribute('src', item.video);
                domBackgroundSource.setAttribute('type', 'video/mp4');
                domBackground.appendChild(domBackgroundSource);
                domItem.appendChild(domBackground);
            } else {
                let domBackground = document.createElement('div');
                domBackground.className = 'itemBackground';
                domBackground.style['background-image'] = 'url(\'' + item.image + '\')'
                domItem.appendChild(domBackground);
            }
            
    
            let domContent = document.createElement('div');
            domContent.className = 'itemContent';
            
            domContent.onclick = () => {document.querySelector('#bg' + i).play();};
            let domContentBig = document.createElement('div');
            domContentBig.className = 'CBig';
    
            let domTitle = document.createElement('h3');
            domTitle.className = 'piTitle';
            domTitle.innerHTML = item.name;
    
            let domDesc = document.createElement('span');
            domDesc.className = 'piOrg';
            domDesc.innerHTML = (item.desc ? item.desc.replace(/\n/g, '<br>') : item.real)
            domContentBig.appendChild(domTitle);
            domContentBig.appendChild(domDesc);
            if (item.additionalCardHtml) {
                let domContentSmall = document.createElement('div');
                domContentSmall.innerHTML = item.additionalCardHtml;
                domContent.appendChild(domContentSmall);
            }
    
            domContent.appendChild(domContentBig);
            domItem.appendChild(domContent);

            this.target.className = 'grid';
            this.target.appendChild(domItem);
        })
    }
}
fetch('https://testausserveri.fi/projects.json')
.then(res => res.json())
.then((data) => {
    console.log(data);
    const projects = new Grid(data.projects, "#projects");
}).catch(e => {
    console.error("Failed to get projects list", e)
    document.getElementById("projects").innerHTML = "<p style=\"text-align: center;\">Projektilistaa ei voida näyttää. Tapahtui virhe :(</p>"
})

function metaRepoLink(event) {
    alert('Muiden projektien lista näkyy ainoastaan Testausserverin jäsenille. Liity ensin palvelimellemme ja sitä kautta GitHub-organisaatioomme nähdäksesi tämän listan.')
}