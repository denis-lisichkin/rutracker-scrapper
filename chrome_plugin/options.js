// 
// Chrome local storage variables:
// - catalog_json
// - themes_list
// - option_current_category_url
// - option_get_catalog
// - option_get_themes_list
// - themes_list_pages
//

function run_catalog_queue(catalog_json, queue_length) {
	for (let i = 1; i <= queue_length; i++) {
		console.log(catalog_json.forums);
		if (catalog_json.forums) {
			console.log(i);
			window.open(catalog_json.forums.pop());
		}
	}
}

function show_categories() {
	chrome.storage.local.get(["catalog_json"]).then((result) => {
		if (result.catalog_json) {
			let catalog_obj = JSON.parse(result.catalog_json)
			let catalog_html_element = document.getElementById("category_map");
			catalog_html_element.innerHTML = "";
			let selected_element = null;
			let category_url = document.getElementById("category-url");
			for (let category_html_element of catalog_obj.category_level1) {
				let ul_element = document.createElement("ul");
				ul_element.classList.add("ul-mod");
				let li_element = document.createElement("li");
				li_element.classList.add("li-mod");
				let span_element = document.createElement("span");
				span_element.classList.add("span-mode-closed");
				span_element.classList.add("span-level1");
				ul_element.appendChild(li_element);
				li_element.appendChild(span_element);
				span_element.innerText = category_html_element.category_level1_title;
				for (let category2_html_element of category_html_element.category_level2) {
					let ul2_element = document.createElement("ul");
					ul2_element.classList.add("display-none");
					ul2_element.classList.add("ul-mod");
					let li2_element = document.createElement("li");
					li2_element.classList.add("li-mod");
					let span2_element = document.createElement("span");
					span2_element.setAttribute("category-href", category2_html_element.category_level2_href);
					span2_element.classList.add("span-level2");
					span2_element.classList.add("span-mode-closed");
					ul2_element.appendChild(li2_element);
					li2_element.appendChild(span2_element);
					span2_element.innerText = category2_html_element.category_level2_title;
					for (let category3_html_element of category2_html_element.category_level3) {
						let ul3_element = document.createElement("ul");
						ul3_element.classList.add("display-none");
						ul3_element.classList.add("ul-level3");
						let li3_element = document.createElement("li");
						let span3_element = document.createElement("span");
						span3_element.classList.add("span-level3");
						span3_element.setAttribute("category-href", category3_html_element.category_level3_href);
						ul3_element.appendChild(li3_element);
						li3_element.appendChild(span3_element);
						span3_element.innerText = category3_html_element.category_level3_title;
						li2_element.appendChild(ul3_element);
					}
					li_element.appendChild(ul2_element);
				}
				catalog_html_element.appendChild(ul_element);
			}
			let inputs = catalog_html_element.querySelectorAll("li");
			for (let i=0; i < inputs.length; i++) {
				let el = inputs[i];
				let el1 = inputs[i].querySelector(":scope > span");
				let el2 = el.querySelectorAll(":scope > ul");
				if (el2.length == 0) {
					el1.classList.remove("span-mode-closed");
					el1.classList.add("span-mode-empty");
				}
				el1.addEventListener("click", function() {
					event.stopPropagation();
					let cat_href = el1.getAttribute("category-href");
					category_url.href =  cat_href;
					category_url.innerText = cat_href;
					if (selected_element) selected_element.classList.remove("selected");
					el1.classList.add("selected");
					selected_element = el1;
					if (el2.length > 0) {
						el1.classList.toggle("span-mode-closed");
						el1.classList.toggle("span-mode-open");
					}
					for (let j=0; j < el2.length; j++) {
						el2[j].classList.toggle("display-none");
					}
					show_themes_list();
				});
			}
		}
	});
}

function show_themes_list() {
	chrome.storage.local.get(["themes_list"]).then((result)=>{
		let var_themes_list = result.themes_list;
		let toolbar_category_url = document.getElementById("category-url").innerText;
		let sel = document.getElementById("themes-list-table");
		sel.innerHTML = "";
		for (let obj of var_themes_list) {
			if (obj.category_url == toolbar_category_url) {
				for (let el of obj.list) {
				sel.innerHTML += el.title+"<br>";
				}
			break;
			}
		}

	});
}

document.addEventListener("DOMContentLoaded", () => {

	let abc = "hello"
	show_categories();

	document.getElementById("scrape_categories").onclick = function () {
		chrome.storage.local.set({option_get_catalog: true}).then(() => {
			console.log("Option 'option_get_catalog' set to 'true'");
		});
		window.open("https://rutracker.org/forum/index.php?map");
		show_categories();
	};

	chrome.storage.local.set({themes_list_pages: {}}).then(() => {
		console.log("Option 'themes_list_pages' is set to {}");
	});

	chrome.storage.local.get(["themes_list"]).then((result) => {
    if (!result.themes_list) {
    	chrome.storage.local.set({themes_list: []}).then(()=>{
    		console.log("Themes list was created.")
    	});
    }
  });

	document.getElementById("scrape_themes_list").onclick = function () {
		let start_href = document.getElementById("category-url").innerText;
		if (start_href) {
			chrome.storage.local.set({option_get_themes_list: start_href}).then(() => {
				console.log(`Option 'option_get_themes_list' set to '${start_href}'`);
				window.open(start_href);
			});
			chrome.storage.local.set({option_current_category_url: start_href}).then(() => {
				console.log(`Option 'option_current_category_url' set to '${start_href}'`);
			});
			console.log(start_href);
		}
	};

	document.getElementById("clear-all-themes-list").onclick = function () {
		chrome.storage.local.set({themes_list: []}).then(() => {
			console.log("Themes list cleared");
		});
	};
});


chrome.storage.onChanged.addListener((changes, namespace) => {
  for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
    console.log(
      `Storage key "${key}" in namespace "${namespace}" changed.`,
      `Old value was "${oldValue}", new value is "${newValue}".`
    );
    if (key == "catalog_json") {
    	console.log(newValue);
    	let catalog_html_element = document.getElementById("catalog_content");
			catalog_html_element.innerText = newValue;
    }
    if (key == "themes_list") {
    	show_themes_list();
    }
    if (key == "themes_list_pages") {
    	if (newValue.url_list.length > 0){
    		window.open(newValue.url_list[0]);
    	}
    }
  }

});