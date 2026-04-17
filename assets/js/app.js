const containerEl = document.querySelector(".cards");
const baseUrl = "https://headlesscms.hesselbergsdomain.dk/wp-json/";
const postsUrl = "wp/v2/posts?acf_format=standard&per_page=25"


// Henter ALLE public posts
function getAllPosts() {

    fetch(baseUrl + postsUrl)
        .then(res => res.json())
        .then(data => renderArticles(data))
        .catch(err => console.log("FEJL!: ", err));
}


function renderArticles(posts) {
    console.log('data:', posts)
    posts.forEach(post => {
        let ingredients = [];

        // Her looper vi igennem objektet med ingredienser og tilføjer dem til et array
        for (const key in post.acf.ingredienser) {
            const value = post.acf.ingredienser[key];
            if (value) {
                ingredients.push(value)
            }
        }



        //  indsætter HTML for hver post i <section class="cards">


        containerEl.innerHTML += `
		<article class="card">
			<a href="./opskrift.html?slug=${post.slug}">
				<img src="${post.acf.billede.url}" alt="${post.title.rendered}">
				<div class="text">
					<h2>${post.title.rendered}</h2>
					<div class="info">
						<p>TID: ${post.acf.tid_i_alt}</p>
						<p>ANTAL: ${post.acf.antal_portioner}</p>
					</div>
					<p>${truncateWords(post.acf.beskrivelse, 15)}</p>
				</div>
			</a>
		</article>
        `;
    })
}

// vi har fået hjælp af chat
// prompt: "kan man forkorte en tekst til et bestemt antal ord i JavaScript?"
function truncateWords(text, maxWords) {
    const words = text.split(" ");
    if (words.length <= maxWords) return text;
    return words.slice(0, maxWords).join(" ") + "...";
}
if (containerEl) {
    getAllPosts();
}




// FILTER

// Kostpræfference id'er

// allergener
const allergenerID = 33;
const fiskefriID = 35;
const glutenfriID = 26;
const laktosefriID = 24;
const mælkefriID = 36;
const nøddefriID = 28;
const skaldyrsfriID = 37;

// præferencer
const præferencerID = 34;
const børnevenligID = 41;
const halalID = 38;
const kosherID = 39;
const pesketarID = 40;
const veganskID = 25;
const vegatariskID = 27;

// måltidstype id'er
const aftensmadID = 29;
const frokostID = 30;
const morgenmadID = 31;
const dessertID = 32;

// sæsone id'er
const forårID = 20;
const sommerID = 17;
const efterårID = 18
const vinterID = 19;

// tilberedsningstid id'er
const hurtigID = 21;
const mediumID = 22;
const langsomID = 23;


// Henter public posts ud fra taxonomi

function getAllPostsByTax(cooktimeID, seasonID, mealtypeID, preferenceID) {
    let search = `posts?status=publish&categorys=${allergenerID},${fiskefriID},${glutenfriID},${laktosefriID},${mælkefriID},${nøddefriID},${skaldyrsfriID},${præferencerID},${børnevenligID},${halalID},${kosherID},${pesketarID},${veganskID},${vegatariskID},${aftensmadID},${frokostID},${morgenmadID},${dessertID},${forårID},${sommerID},${efterårID},${vinterID},${hurtigID},${mediumID},${langsomID}`;

    if (cooktimeID) {
        search += `&cooktime=${cooktimeID}`
    }
    if (seasonID) {
        search += `&season=${seasonID}`
    }
    if (mealtypeID) {
        search += `&mealtype=${mealtypeID}`
    }
    if (preferenceID) {
        search += `&preference=${preferenceID}`
    }

    fetch(baseUrl + search)
        .then(res => res.json())
        .then(data => renderArticles(data))
        .catch(err => console.log("FEJL!: ", err));
}

getAllPostsByTax(hurtigID, sommerID, aftensmadID, børnevenligID);










// ENKELTE OPSKRIFTER

const parameter = new URLSearchParams(window.location.search);
const slug = parameter.get("slug");


async function hentOpskrift() {
    try {
        const response = await fetch(`${baseUrl}wp/v2/posts?slug=${slug}&acf_format=standard`);
        const data = await response.json();
        // renderopskrift(opskrifter);


        const opskrifter = data[0];

        if (!opskrifter) {
            document.body.innerHTML = "<p>Opskrift ikke fundet</p>";
            return;
        }

        visOpskrift(opskrifter);
    }


    catch (error) {
        console.error("FEJL!: ", error);
        document.body.innerHTML = "<p>Der skete en fejl ved indlæsning af opskriften</p>";
    }
}


const containerEl2 = document.querySelector(".opskriftContainer");


function visOpskrift(opskrift) {

    // filter fjerner tomme værdier, map laver HTML for hver ingrediens og join samler det til en string
    // dette gøres for både ingredienser og fremgangsmåde, da de begge er gemt som objekter med flere værdier i ACF
    const ingredienserHTML = Object.values(opskrift.acf.ingredienser)
        .filter(item => item)
        .map(item => `<li>${item}</li>`)
        .join("");

    const fremgangsmaadeHTML = Object.values(opskrift.acf.fremgangsmade)
        .filter(item => item)
        .map(item => `<li>${item}</li>`)
        .join("");

    containerEl2.innerHTML = `
      <section class="opskriftIntro">
            <img src="${opskrift.acf.billede.url}" alt="${opskrift.title.rendered}">
            <div>
                <h1 class="opskriftTitel">
                    ${opskrift.title.rendered}
                </h1>
                <div class="stars"><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i
                        class="fa-regular fa-star"></i><i class="fa-regular fa-star"></i><i
                        class="fa-regular fa-star"></i>
                    <p>(${opskrift.acf.rating})</p>
                </div>
                <p>TID I ALT: ${opskrift.acf.tid_i_alt}</p>
                <div class="kategorier">
                    <div class="kategori">Under 30 min</div>
                    <div class="kategori">Aftensmad</div>
                    <div class="kategori">tekst</div>
                    <div class="kategori">tekst</div>
                </div>
            </div>
        </section>
        <section>
            <p class="description">${opskrift.acf.beskrivelse}</p>

            <hr>
        </section>
        <p class="antal">ANTAL PERSONER: ${opskrift.acf.antal_portioner} <i class="fa-solid fa-angle-down"></i></p>
        <section class="fremgangsmaade">
            <div class="ingredienser">
                <h2>Ingredienser</h2>
                <ul>
                    ${ingredienserHTML}
                </ul>
            </div>
            <div class="fremgang">
                <h2>Fremgangsmåde</h2>
                <ol>
                    ${fremgangsmaadeHTML}
                </ol>
            </div>
        </section>
        `;
}

if (containerEl2) {
    hentOpskrift();
}