function make_forums_json() {
  let sel1 = document.querySelectorAll("#f-map > ul.tree-root > li");
  let root_json_object = new Object();
  root_json_object.category_level1 = [];
  for (let el1 of sel1) {
    let obj_level1 = new Object();
    obj_level1.category_level1_title = el1.querySelector("span.b > span.c-title").innerText;
    let sel2 = el1.querySelectorAll(":scope > ul > li");
    obj_level1.category_level2 = []
    for (let el2 of sel2) {
      let obj_level2 = new Object();
      let sel3 = el2.querySelector(":scope > span.b > a");
      obj_level2.category_level2_title = sel3.innerText;
      obj_level2.category_level2_href = sel3.href;
      obj_level2.category_level3 = [];
      let sel4 = el2.querySelectorAll(":scope > ul > li > span > a");
      for (let el3 of sel4) {
        let obj_level3 = new Object();
        obj_level3.category_level3_title = el3.innerText;
        obj_level3.category_level3_href = el3.href;
        obj_level2.category_level3.push(obj_level3);
      }
      obj_level1.category_level2.push(obj_level2);
    }
    root_json_object.category_level1.push(obj_level1);
  }
  return JSON.stringify(root_json_object);
}

function get_pages_num() {
  let sel = null;
  sel = document.querySelector("#main_content_wrap > table:first-child > tbody > tr > td > div:nth-child(2)");
  if ((!sel.querySelector(":scope a")) && (sel.innerText != "Страницы:  1")) {
    sel = document.querySelector("#main_content_wrap > table:first-child > tbody > tr > td > div:nth-child(3)");
  }
  let pages_num = null;
  if (sel.innerText == "Страницы:  1") {
    pages_num = 1;
  } else {
    let sel1 = sel.querySelector(":scope > b > a:nth-last-child(2)");
    pages_num = parseInt(sel1.innerText, 10);
  }
  return pages_num;
}

function make_themes_page_list() {
  let themes_page_list = {};
  themes_page_list.category_url = window.location.href;
  themes_page_list.url_list = [];
  let pages_num = get_pages_num();
  for (let i=2; i <= pages_num; i++) {
    themes_page_list.url_list.push(window.location.href+`&start=${(i-1)*50}`);
  }
  return themes_page_list;
}

function get_themes_array() {
  let arr =[]
  let sel = document.querySelectorAll(".hl-tr");
  for (let el of sel) {
    let obj = {};
    let sel_title = el.querySelector(".vf-col-t-title > span.topictitle > a.topictitle");
    if (!sel_title) {
      sel_title = el.querySelector(".vf-col-t-title > div.torTopic > a.torTopic");
    }
    obj.title = sel_title.innerText;
    obj.title_href = sel_title.href;
    arr.push(obj);
  }
  return arr;
}


function get_themes_list() {
  chrome.storage.local.get(["themes_list"]).then((result)=>{
    let var_themes_list = result.themes_list;
    console.log(var_themes_list);
    chrome.storage.local.get(["option_current_category_url"]).then((result)=>{
      let list_found = false;
      for (obj of var_themes_list) {
        if (obj.category_url == result.option_current_category_url) {
          list_found = true;
          obj.list = obj.list.concat(get_themes_array());
        }
      }
      if (!list_found) {
        let obj = {};
        obj.category_url = result.option_current_category_url;
        obj.list = [];
        obj.list = obj.list.concat(get_themes_array());
        var_themes_list.push(obj);
      }
      chrome.storage.local.set({themes_list: var_themes_list}).then(()=>{
        window.close();
      });
    });
  });
}

function clear_themes_list() {
  chrome.storage.local.get(["themes_list"]).then((result) => {
    let var_themes_list = result.themes_list;
    for (let obj of var_themes_list) {
      if (obj.category_url == window.location.href) {
        const index = var_themes_list.indexOf(obj);
        var_themes_list.splice(index, 1);
        chrome.storage.local.set({themes_list: var_themes_list}).then(()=>{
          console.log("Themes list was updated.");
        });
        break;
      }
    }
    get_themes_list();
  });
}

//Get forum tree
if (window.location.href == "https://rutracker.org/forum/index.php?map") {
  chrome.storage.local.get(["option_get_catalog"]).then((result) => {
    if (result.option_get_catalog) {
      chrome.storage.local.set({option_get_catalog: false}).then(() => {
        chrome.storage.local.set({catalog_json: make_forums_json()}).then(() => {
          window.close();
        });
      });
    }
  });
}

//Get first themes list.
chrome.storage.local.get(["option_get_themes_list"]).then((result) => {
  if (result.option_get_themes_list == window.location.href) {
    chrome.storage.local.set({option_get_themes_list: false}).then(() => {
      chrome.storage.local.set({themes_list_pages: make_themes_page_list()}).then(() => {
        clear_themes_list();
      });
    });
  }
});

//Get subsequent themes list.
chrome.storage.local.get(["themes_list_pages"]).then((result) => {
  if (result.themes_list_pages.url_list) {
    if (result.themes_list_pages.url_list.includes(window.location.href)) {
      let updated_list_pages = result.themes_list_pages;
      const index = updated_list_pages.url_list.indexOf(window.location.href);
      if (index > -1) {
        updated_list_pages.url_list.splice(index, 1);
      }
      chrome.storage.local.set({themes_list_pages: updated_list_pages}).then(() => {
        get_themes_list();
      });
    }
  }
});