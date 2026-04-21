// Vælg container til alle opskriftskort
const containerEl = document.querySelector(".cards");
// Definer basis-URL til WordPress REST API
const baseUrl = "https://headlesscms.hesselbergsdomain.dk/wp-json/";
// Definer URL-parameter til at hente alle posts
const postsUrl = "wp/v2/posts?acf_format=standard&per_page=25"
// https://headlesscms.hesselbergsdomain.dk/wp-json/wp/v2/posts?acf_format=standard&per_page=25

// Henter ALLE public posts
function getAllPosts() {

    fetch(baseUrl + postsUrl)
        .then(res => res.json())
        .then(data => renderArticles(data))
        .catch(err => console.log("FEJL!: ", err));
}

// vis opskrifter som card
function renderArticles(posts) {
    console.log('data:', posts)
    posts.forEach(post => {
        let ingredients = [];

        // Her loopes der igennem objektet med ingredienser og tilføjer dem til et array
        for (const key in post.acf.ingredienser) {
            const value = post.acf.ingredienser[key];
            if (value) {
                ingredients.push(value)
            }
        }

        //  indsætter HTML for hver post i .cards
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

// Her har vi fået hjælp af chat
// prompt: "kan man forkorte en tekst til et bestemt antal ord i JavaScript?"

// Splitter teksten ved mellemrum
// Hvis teksten er kortere end maxOrd: returners teksten som den er
// Ellers returners de første ord med "..." til sidst
function truncateWords(text, maxWords) {
    const words = text.split(" ");
    if (words.length <= maxWords) return text;
    return words.slice(0, maxWords).join(" ") + "...";
}

// kalder getAllPost
if (containerEl) {
    getAllPosts();
}


// ENKELTE OPSKRIFTER
// Henter slug-parameteret fra URL'en (fx ?slug=hamburgere)
const parameter = new URLSearchParams(window.location.search);
const slug = parameter.get("slug");


async function hentOpskrift() {
    try {
        // Fetcher opskrift fra API med det givne slug
        const response = await fetch(`${baseUrl}wp/v2/posts?slug=${slug}&acf_format=standard`);
        const data = await response.json();
        // renderopskrift(opskrifter);


        const opskrifter = data[0];


        // Hvis ingen opskrift blev fundet: vis fejlbesked
        if (!opskrifter) {
            document.body.innerHTML = "<p>Opskrift ikke fundet</p>";
            return;
        }

        // sender opskrift til visOpskrift
        visOpskrift(opskrifter);
    }


    catch (error) {
        console.error("FEJL!: ", error);
        document.body.innerHTML = "<p>Der skete en fejl ved indlæsning af opskriften</p>";
    }
}


const containerEl2 = document.querySelector(".opskriftContainer");
const containerEl3 = document.querySelector(".andreOpskrifter");


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
                    <div class="kategori">${opskrift.maltidstype[0]}</div>
                    <div class="kategori">Aftensmad</div>
                    <div class="kategori">Halal</div>
        
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


    // HENTER 4 ANDRE OPSKRIFTER MED SAMME MÅLTIDSTYPE

    async function hentAndreOpskrifter(opskrift) {
        // Hent første måltidstype-ID fra den aktuelle opskrift
        const maltidstype = opskrift.maltidstype[0];
        // Fetcher 4 opskrifter med samme måltidstype og ekskluder den aktuelle
        const response = await fetch(
            `${baseUrl}wp/v2/posts?acf_format=standard&per_page=4&maltidstype=${maltidstype}&exclude=${opskrift.id}`
        );
        const data = await response.json();


        // Hvis der ikke er nogen resultater, tømmes containeren
        if (!data.length) {
            containerEl3.innerHTML = "";
            return;
        }


        // kort for hver opskrift og indsættes i .andreOpskrifter
        const cardsHTML = data.map(post => `
        <article class="andreCard">
            <a href="./opskrift.html?slug=${post.slug}">
                <img src="${post.acf.billede.url}" alt="${post.title.rendered}">
                <div class="text">
                    <h2>${post.title.rendered}</h2>
                    <p>${truncateWords(post.acf.beskrivelse, 15)}</p>
                </div>
            </a>
        </article>
    `).join("");

        containerEl3.innerHTML = `
        ${cardsHTML}
    `;
    }

    // Kalder hentAndreOpskrifter med den aktuelle opskrift
    hentAndreOpskrifter(opskrift);

    // BREADCRUMB
    // Opdatere breadcrumb med link til forsiden og den aktuelle opskrifts titel
    const breadcrumb = document.querySelector(".breadcrumb");
    breadcrumb.innerHTML = `
    <a href="./index.html">Alle opskrifter</a>
    <i class="fa-solid fa-angle-right"></i>
    <p>${opskrift.title.rendered}</p>
`;
}

if (containerEl2) {
    hentOpskrift();

}





// FILTER

// FILTERKNAP

const filterBtn = document.querySelector(".filter");
const filterForm = document.querySelector(".filtrerForm");

// Når der klikkes, vises/skjules filterformularen med .active klassen
if (filterBtn) {
    filterBtn.addEventListener("click", (e) => {
        e.preventDefault();
        filterForm.classList.toggle("active");
    });
}



// Definere taxonomy ID'er
// Kostpræfference id'er

// allergener
// const allergenerID = 33;
const fiskefriID = 35;
const glutenfriID = 26;
const laktosefriID = 24;
const mælkefriID = 36;
const nøddefriID = 28;
const skaldyrsfriID = 37;

// præferencer
// const præferencerID = 34;
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
const snackID = 42;

// sæson id'er
const forårID = 20;
const sommerID = 17;
const efterårID = 18
const vinterID = 19;

// tilberedsningstid id'er
const hurtigID = 21;
const mediumID = 22;
const langsomID = 23;


const formEl = document.querySelector(".filtrerForm");


if (formEl) {
    formEl.addEventListener("submit", (e) => {
        e.preventDefault();
        hentFiltrerdeOpskrifter();
    });
}

// Når formularen submittes kaldes hentFiltrerdeOpskrifter
if (formEl) {
    formEl.querySelectorAll("select").forEach(select => {
        select.addEventListener("change", () => {
            // Tilføj/fjern hasValue klasse baseret på om en værdi er valgt
            if (select.value) {
                select.classList.add("hasValue");
            } else {
                select.classList.remove("hasValue");
            }

            // Hent automatisk nye resultater når filter ændres
            hentFiltrerdeOpskrifter();
        });
    });
}

// Nulstil knap
const nulstilKnap = document.querySelector(".nulstilKnap");

if (nulstilKnap) {
    nulstilKnap.addEventListener("click", () => {
        formEl.reset();

        // Fjern hasValue fra alle selects
        formEl.querySelectorAll("select").forEach(select => {
            select.classList.remove("hasValue");
        });

        // Hent alle opskrifter igen uden filtre
        getAllPosts();
    });
}


// Byg URL med valgte taxonomy ID'er og hent opskrifter
async function hentFiltrerdeOpskrifter() {
    // Henter værdier fra alle select-felter i formularen
    const allergener = formEl.allergener.value;
    const præferencer = formEl.præferencer.value;
    const måltidstyper = formEl.måltidstyper.value;
    const sæson = formEl.sæson.value;
    const tilberedningstid = formEl.tilberedningstid.value;

    let url = baseUrl + "wp/v2/posts?acf_format=standard&per_page=25";


    // Tilføjer kun de parametre der er valgt
    if (præferencer) url += `& kostpraeference=${præferencer} `;
    if (allergener) url += `& kostpraeference=${allergener} `;
    if (måltidstyper) url += `& maltidstype=${måltidstyper} `;
    if (sæson) url += `& saeson=${sæson} `;
    if (tilberedningstid) url += `& tilberedningstid=${tilberedningstid} `;

    try {
        const response = await fetch(url);
        const data = await response.json();

        containerEl.innerHTML = "";

        if (data.length === 0) {
            containerEl.innerHTML = "<p>Ingen opskrifter matcher dine filtre.</p>";
            return;
        }

        renderArticles(data);

    } catch (err) {
        console.error("Fejl ved filtrering:", err);
    }
}







// FORÅRETS GRØNT
const containerEl4 = document.querySelector(".greensCards");



// Fetcher opskrifter med kostpræference vegansk (25)
fetch(`${baseUrl}wp/v2/posts?acf_format=standard&per_page=25&kostpraeference=25`)
    .then(res => res.json())
    .then(data => {
        data.forEach(post => {
            containerEl4.innerHTML += `
                <article class="greensCard">
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
        });
    })



// ULVETIMEN

// Fetcher opskrifter med måltidstupe snacks (42)
const containerEl5 = document.querySelector(".ulveCards");

fetch(`${baseUrl}wp/v2/posts?acf_format=standard&per_page=25&maltidstype=42`)
    .then(res => res.json())
    .then(data => {
        data.forEach(post => {
            containerEl5.innerHTML += `
                <article class="ulveCard">
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
        });
    })
