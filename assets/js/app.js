const containerEl = document.querySelector(".cards");
const baseUrl = "https://headlesscms.hesselbergsdomain.dk/wp-json/";
const postsUrl = "wp/v2/posts?acf_format=standard"


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
						<p>ANTAL: ${post.acf.antal}</p>
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







const parameter = new URLSearchParams(window.location.search);
const slug = parameter.get("slug");


// const titleEl = document.querySelector(".opskriftTitel");
// const descriptionEl = document.querySelector(".description");
// const tidEl = document.querySelector(".tid");
// const antalEl = document.querySelector(".antal");
// const ingredienserEl = document.querySelector(".ingredienser");
// const fremgangEl = document.querySelector(".fremgang");
// const kategorierEl = document.querySelector(".kategorier");
// const starsEl = document.querySelector(".stars");
// const billedeEl = document.querySelector(".opskriftIntro img");
// const breadCrumbsEl = document.querySelector(".breadcrumb");


async function hentOpskrift() {
    try {
        const response = await fetch(`${baseUrl}wp/v2/posts?slug=${slug}`);
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
        <p class="antal">ANTAL PERSONER <i class="fa-solid fa-angle-down"></i></p>
        <section class="fremgangsmaade">
            <div class="ingredienser">
                <h2>Ingredienser</h2>
                <ul>
                    <li>${opskrift.acf.ingredienser[0]}</li>
                    <li>${opskrift.acf.ingredienser[1]}</li>
                    <li>${opskrift.acf.ingredienser[2]}</li>
                    <li>${opskrift.acf.ingredienser[3]}</li>
                    <li>${opskrift.acf.ingredienser[4]}</li>
                    <li>${opskrift.acf.ingredienser[5]}</li>
                    <li>${opskrift.acf.ingredienser[6]}</li>
                    <li>${opskrift.acf.ingredienser[7]}</li>
                    <li>${opskrift.acf.ingredienser[8]}</li>
                </ul>
            </div>
            <div class="fremgang">
                <h2>Fremgangsmåde</h2>
                <ol>
                    <li>${opskrift.acf.fremgangsmade[0]}</li>
                    <li>${opskrift.acf.fremgangsmade[1]}</li>
                    <li>${opskrift.acf.fremgangsmade[2]}</li>
                    <li>${opskrift.acf.fremgangsmade[3]}</li>
                    <li>${opskrift.acf.fremgangsmade[4]}</li>
                    <li>${opskrift.acf.fremgangsmade[5]}</li>
                    <li>${opskrift.acf.fremgangsmade[6]}</li>
                    <li>${opskrift.acf.fremgangsmade[7]}</li>
                    <li>${opskrift.acf.fremgangsmade[8]}</li>
                </ol>
            </div>
        </section>
        `;
}

if (containerEl2) {
    hentOpskrift();
}