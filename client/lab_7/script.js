function mapInit()  {
  let mymap = L.map('mapid').setView([38.989, -76.93], 12);

  L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
      attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      maxZoom: 18,
      id: 'mapbox/streets-v11',
      tileSize: 512,
      zoomOffset: -1,
      accessToken: 'pk.eyJ1IjoicmF2aW9saS0xMDEwIiwiYSI6ImNrdXNuYmZ3dDVncWcycG1ubDF4a2N4ZTcifQ.S-jkWkSM6cGm4lmpdIhFzw'
  }).addTo(mymap);  
  return mymap
}

async function windowActions()  {
    const endpoint = 'https://data.princegeorgescountymd.gov/resource/umjn-t2iz.json';
    const request = await fetch(endpoint)
    const restaurants = await request.json()
    const mymap = mapInit()


    function findMatches(wordToMatch, restaurants) {
      return restaurants.filter(place => {
        const regex = new RegExp(wordToMatch, 'gi');
        return place.name.match(regex) || place.zip.match(regex)
      });
    }
    
    function displayMatches(event) {
      const matchArray = findMatches(event.target.value, restaurants);
      matchSlice = matchArray.slice(0,5)
      matchSlice.forEach(element => {
        let coordinates = element.geocoded_column_1.coordinates.reverse()
        console.log(coordinates)
        L.marker(coordinates).addTo(mymap);

     })
      const html = matchSlice.map(place => {
        return `
          <li class = 'box'>
            <span class="name">${place.name}</span>
            <span class="zip">${place.address_line_1}</span>
          </li>
        `;
      }).join('');
      suggestions.innerHTML = html;

    }
    
    const searchInput = document.querySelector('.input');
    const suggestions = document.querySelector('.suggestions');
    
    searchInput.addEventListener('change', displayMatches);
    searchInput.addEventListener('keyup', (evt) => { displayMatches(evt) });
    }
    window.onload = windowActions;

    