/* BEXLEY Angré — panier, favoris et commande WhatsApp
   IMPORTANT : remplacez WHATSAPP_NUMBER par le numéro WhatsApp officiel
   au format international sans +, espace ni zéro initial (ex. 2250700000000). */
const WHATSAPP_NUMBER = "2250172254141"; // À confirmer : numéro fourni, vérifier qu'il reçoit WhatsApp.

const products = [
  {id:"shoe-classic",name:"Derby classique",category:"Chaussures",price:null,label:"Élégance",image:"https://images.unsplash.com/photo-1614252369475-531ased9e7c7?auto=format&fit=crop&w=700&q=85",description:"Chaussure habillée en cuir"},
  {id:"shoe-loafer",name:"Mocassin signature",category:"Chaussures",price:null,label:"Sélection",image:"https://images.unsplash.com/photo-1531310197839-ccf54634509e?auto=format&fit=crop&w=700&q=85",description:"Mocassin au style intemporel"},
  {id:"shoe-sneaker",name:"Sneaker urbaine",category:"Chaussures",price:null,label:"Style casual",image:"https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=700&q=85",description:"Sneaker pour le quotidien"},
  {id:"shoe-leather",name:"Chaussure en cuir",category:"Chaussures",price:null,label:"Classique",image:"https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=700&q=85",description:"Finition élégante et soignée"},
  {id:"accessory-belt",name:"Ceinture élégante",category:"Accessoires",price:null,label:"Essentiel",image:"https://images.unsplash.com/photo-1624222247344-550fb8c5b4f7?auto=format&fit=crop&w=700&q=85",description:"Accessoire à assortir"},
  {id:"accessory-bag",name:"Sac du quotidien",category:"Accessoires",price:null,label:"Pratique",image:"https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=700&q=85",description:"Un essentiel au quotidien"}
];
const $ = (selector, root=document) => root.querySelector(selector);
const $$ = (selector, root=document) => [...root.querySelectorAll(selector)];
let cart = readStore("bexleyCart", {});
let favorites = readStore("bexleyFavorites", []);
let activeFilter = "Tous";
let searchText = "";

function readStore(key, fallback){try{return JSON.parse(localStorage.getItem(key)) ?? fallback;}catch{return fallback;}}
function saveStore(){localStorage.setItem("bexleyCart",JSON.stringify(cart));localStorage.setItem("bexleyFavorites",JSON.stringify(favorites));}
function money(price){return price == null ? "Prix à confirmer" : new Intl.NumberFormat("fr-FR").format(price)+" FCFA";}
function waUrl(message){return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;}
function contactWhatsApp(message="Bonjour BEXLEY Angré, je souhaite avoir des informations sur vos produits."){if(!/^\d{10,15}$/.test(WHATSAPP_NUMBER)){alert("Le numéro WhatsApp n'est pas encore configuré. Modifiez WHATSAPP_NUMBER dans app.js.");return;}window.open(waUrl(message),"_blank","noopener,noreferrer");}
function productCard(p){const fav=favorites.includes(p.id);return `<article class="product-card"><div class="product-image"><img src="${p.image}" alt="${p.name}" loading="lazy"><span class="product-tag">${p.label}</span><button class="favorite-button ${fav?"is-favorite":""}" data-favorite="${p.id}" aria-label="${fav?"Retirer des favoris":"Ajouter aux favoris"}">${fav?"♥":"♡"}</button></div><div class="product-info"><span class="product-category">${p.category}</span><h3>${p.name}</h3><div class="product-bottom"><span class="product-price">${money(p.price)}</span><button class="add-button" data-add="${p.id}">+ Ajouter au panier</button></div></div></article>`;}
function renderHome(){const target=$("#homeProducts");if(target)target.innerHTML=products.slice(0,4).map(productCard).join("");}
function renderShop(){const target=$("#shopProducts");if(!target)return;const list=products.filter(p=>(activeFilter==="Tous"||p.category===activeFilter)&&`${p.name} ${p.category} ${p.description}`.toLowerCase().includes(searchText.toLowerCase()));target.innerHTML=list.map(productCard).join("");$("#emptyProducts").hidden=list.length>0;}
function renderCart(){const target=$("#cartItems");if(!target)return;const entries=Object.entries(cart).filter(([id,q])=>q>0&&products.some(p=>p.id===id));const total=entries.reduce((sum,[,q])=>sum+q,0);$("#cartCount").textContent=total;$("#sideCartCount").textContent=total;$("#cartQuantity").textContent=total;target.innerHTML=entries.length?entries.map(([id,q])=>{const p=products.find(x=>x.id===id);return `<div class="cart-row"><img src="${p.image}" alt=""><div><strong>${p.name}</strong><small>${money(p.price)}</small><div class="quantity-controls"><button data-qty="${id}" data-delta="-1" aria-label="Retirer un article">−</button><span>${q}</span><button data-qty="${id}" data-delta="1" aria-label="Ajouter un article">+</button></div></div><button class="remove-item" data-remove="${id}" aria-label="Supprimer ${p.name}">×</button></div>`;}).join(""):'<p class="empty-note">Votre panier est encore vide. Ajoutez un article pour commencer.</p>';saveStore();syncOrderItems();}
function renderFavorites(){const target=$("#favoriteItems");if(!target)return;const favProducts=favorites.map(id=>products.find(p=>p.id===id)).filter(Boolean);$("#favCount").textContent=favorites.length;$("#sideFavCount").textContent=favorites.length;target.innerHTML=favProducts.length?favProducts.map(p=>`<div class="favorite-row"><img src="${p.image}" alt=""><div><strong>${p.name}</strong><small>${money(p.price)}</small></div><button data-add="${p.id}">Ajouter</button></div>`).join(""):'<p class="empty-note">Vos favoris apparaîtront ici.</p>';saveStore();renderFavoritesModal();}
function syncOrderItems(){const field=$("#formItems");if(!field)return;const lines=Object.entries(cart).filter(([,q])=>q>0).map(([id,q])=>{const p=products.find(x=>x.id===id);return p?`${p.name} x ${q} — taille/pointure à préciser`:null;}).filter(Boolean);if(lines.length)field.value=lines.join("\n");}
function renderAll(){renderHome();renderShop();renderCart();renderFavorites();const year=$("#year");if(year)year.textContent=new Date().getFullYear();}
function addToCart(id){cart[id]=(cart[id]||0)+1;renderCart();renderFavorites();renderShop();renderHome();}
function toggleFavorite(id){favorites=favorites.includes(id)?favorites.filter(x=>x!==id):[...favorites,id];renderFavorites();renderShop();renderHome();}
document.addEventListener("click",event=>{const add=event.target.closest("[data-add]");if(add){addToCart(add.dataset.add);return;}const fav=event.target.closest("[data-favorite]");if(fav){toggleFavorite(fav.dataset.favorite);return;}const qty=event.target.closest("[data-qty]");if(qty){const id=qty.dataset.qty;cart[id]=Math.max(0,(cart[id]||0)+Number(qty.dataset.delta));if(!cart[id])delete cart[id];renderCart();return;}const remove=event.target.closest("[data-remove]");if(remove){delete cart[remove.dataset.remove];renderCart();return;}const filter=event.target.closest("[data-filter]");if(filter){activeFilter=filter.dataset.filter;$$("[data-filter]").forEach(b=>b.classList.toggle("active",b===filter));renderShop();return;}const wa=event.target.closest("[data-whatsapp]");if(wa){event.preventDefault();contactWhatsApp();}});
$("#menuToggle")?.addEventListener("click",()=>{const nav=$("#mainNav");const open=nav.classList.toggle("open");$("#menuToggle").setAttribute("aria-expanded",String(open));$("#menuToggle").setAttribute("aria-label",open?"Fermer le menu":"Ouvrir le menu");});
$$(".main-nav a").forEach(a=>a.addEventListener("click",()=>{$("#mainNav")?.classList.remove("open");$("#menuToggle")?.setAttribute("aria-expanded","false");}));
$("#productSearch")?.addEventListener("input",event=>{searchText=event.target.value;renderShop();});
$("#clearCart")?.addEventListener("click",()=>{if(Object.keys(cart).length&&!confirm("Voulez-vous vider le panier ?"))return;cart={};renderCart();});
$("#checkoutButton")?.addEventListener("click",()=>{const entries=Object.entries(cart).filter(([,q])=>q>0);if(!entries.length){alert("Votre panier est vide. Ajoutez d'abord un article.");return;}const lines=entries.map(([id,q])=>{const p=products.find(x=>x.id===id);return `• ${p.name} x ${q} — prix à confirmer, taille/pointure à préciser`;});contactWhatsApp("Bonjour BEXLEY Angré,\nJe souhaite commander ou vérifier la disponibilité des articles suivants :\n\n"+lines.join("\n")+"\n\nMerci de me confirmer les prix, les tailles disponibles et les modalités de livraison.");});
$("#orderForm")?.addEventListener("submit",event=>{event.preventDefault();const data=new FormData(event.currentTarget);const message=`Bonjour BEXLEY Angré,\nJe souhaite passer une demande de commande.\n\nNom : ${data.get("customerName")}\nTéléphone : ${data.get("customerPhone")}\nArticle(s) : ${data.get("customerItems")}\nRéception : ${data.get("delivery")}\nPrécisions : ${data.get("notes")||"Aucune"}\n\nMerci de confirmer la disponibilité et les prix.`;contactWhatsApp(message);});
renderAll();


// Fenêtre responsive des favoris
function renderFavoritesModal(){
  const target=document.getElementById("modalFavoriteItems");
  const count=document.getElementById("modalFavCount");
  if(!target||!count)return;
  const items=favorites.map(id=>products.find(p=>p.id===id)).filter(Boolean);
  count.textContent=items.length;
  target.innerHTML=items.length?items.map(p=>`<div class="modal-favorite-row"><img src="${p.image}" alt="${p.name}"><div><strong>${p.name}</strong><small>${p.category} · ${money(p.price)}</small></div><div class="modal-favorite-actions"><button type="button" data-modal-add="${p.id}">Ajouter au panier</button><button type="button" class="modal-remove-fav" data-modal-remove-fav="${p.id}">Retirer</button></div></div>`).join(""):'<p class="empty-note">Vous n’avez pas encore ajouté de favoris. Touchez le cœur sur un produit pour le retrouver ici.</p>';
}
function openFavoritesModal(){const modal=document.getElementById("favoritesModal");if(!modal)return;renderFavoritesModal();modal.classList.add("is-open");modal.setAttribute("aria-hidden","false");document.body.classList.add("modal-open");modal.querySelector(".favorites-close")?.focus();}
function closeFavoritesModal(){const modal=document.getElementById("favoritesModal");if(!modal)return;modal.classList.remove("is-open");modal.setAttribute("aria-hidden","true");document.body.classList.remove("modal-open");}
document.addEventListener("click",event=>{
  if(event.target.closest(".favorites-trigger")){event.preventDefault();openFavoritesModal();return;}
  if(event.target.closest("[data-close-favorites]")){closeFavoritesModal();return;}
  const modalAdd=event.target.closest("[data-modal-add]");if(modalAdd){addToCart(modalAdd.dataset.modalAdd);renderFavoritesModal();return;}
  const modalRemove=event.target.closest("[data-modal-remove-fav]");if(modalRemove){favorites=favorites.filter(id=>id!==modalRemove.dataset.modalRemoveFav);renderFavorites();renderShop();renderHome();renderFavoritesModal();return;}
});
document.addEventListener("keydown",event=>{if(event.key==="Escape")closeFavoritesModal();});
document.getElementById("clearFavorites")?.addEventListener("click",()=>{if(!favorites.length)return;if(!confirm("Effacer tous les favoris ?"))return;favorites=[];renderFavorites();renderShop();renderHome();renderFavoritesModal();});
document.getElementById("continueShopping")?.addEventListener("click",()=>{closeFavoritesModal();if(location.pathname.endsWith("boutique.html"))document.getElementById("produits")?.scrollIntoView({behavior:"smooth"});else location.href="boutique.html#produits";});
