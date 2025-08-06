function createLinks(teams) {
    // Remove existing list if it exists
    const existingList = document.getElementById('team-list-nav');
    if (existingList) {
        existingList.remove();
    }

    // Create new unordered list
    const ul = document.createElement('ul');
    ul.id = 'team-list-nav';
    ul.className = 'team-links';

    // Add each team as a list item
    teams.forEach(team => {
        const li = document.createElement('li');
        li.style.backgroundColor = team.primary;

        // Create anchor element
        const a = document.createElement('a');
        a.href = team.url;
        a.style.color = team.secondary;
        a.innerHTML = `<strong>${team.name}</strong>`;

        // Create copy span
        const span = document.createElement('span');
        span.textContent = ' [copy]';
        span.style.cursor = 'pointer';
        span.addEventListener('click', () => {
            navigator.clipboard.writeText(team.url)
                .then(() => {
                    span.textContent = ' [copied!]';
                    setTimeout(() => {
                        span.textContent = ' [copy]';
                    }, 2000);
                })
                .catch(err => {
                    console.error('Failed to copy URL: ', err);
                });
        });

        // Append elements
        li.appendChild(a);
        li.appendChild(span);
        ul.appendChild(li);
    });

    // Add hover effect using JavaScript instead of CSS
    ul.addEventListener('mouseover', (e) => {
        if (e.target.tagName === 'LI') {
            const a = e.target.querySelector('a');
            if (a) {
                a.querySelector('strong').style.fontWeight = 'bold';
            }
        }
    });

    ul.addEventListener('mouseout', (e) => {
        if (e.target.tagName === 'LI') {
            const a = e.target.querySelector('a');
            if (a) {
                a.querySelector('strong').style.fontWeight = 'normal';
            }
        }
    });

    // Append to body
    document.body.appendChild(ul);
}