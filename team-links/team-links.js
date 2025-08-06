


function createLinks(teams) {
  
  const oldList = document.getElementById("team-list-nav")
  if (oldList) oldList.remove("team-list-nav")


    const ul = document.createElement("ul")
    ul.id = "team-list-nav"
    ul.class = "team-links"


    teams.forEach(team => {
        li = document.createElement("li")
        li.style.background = team.primary


        link = document.createElement("a")
        link.href = team.url
        link.textContent = team.name
        link.style.background = team.secondary


        const span = document.createElement('span')
        span.textContent = "[copy]"
        span.class = "copy-btn"
        
        span.addEventListener('click', () => {
          navigator.clipboard.writeText(team.url)
        })

        li.appendChild(link)
        li.appendChild(document.createTextNode(' '))
        li.appendChild(span)
        ul.appendChild(li)
    });

    document.body.appendChild(ul)

}