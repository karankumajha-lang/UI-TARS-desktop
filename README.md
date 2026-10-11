# Doky Dory Shop

Doky Dory ki online order site. Isme **do alag panel** hain:

| Panel | Kaun use karta hai | Address |
| --- | --- | --- |
| **Customer panel** (shop) | Customers: item chuno, outlet name daalo, payment mode chuno (UPI ya Other), PO (purchase order) PDF download | `/` |
| **Admin panel** | Sirf aap (password se): orders, har order ka PO download, items aur prices, photos, delivery charge, Excel backup | `/admin` |

Har naya order turant **dokydoryofficial@gmail.com** par email hota hai, aur email aane se pehle hi save ho jata hai.

## Folder mein kya hai

```
doky-dory-shop/
├── customer-panel/            CUSTOMER PANEL (shop)
│   ├── public/index.html        shop ka page: items, cart, outlet name, payment mode, UPI QR
│   ├── public/po-pdf.js         PO (purchase order) PDF banata hai: customer aur admin panel dono yahi use karte hain
│   ├── public/logo*.png         logo aur icon
│   └── routes.js                shop ka server part: price list, order save, order dhundhna
├── admin-panel/               ADMIN PANEL (sirf aapke liye)
│   ├── login.html               admin login page
│   ├── admin.html               orders, items & prices, settings
│   └── routes.js                admin ka server part: login, items, prices, photos, Excel
├── shared/                    dono panel yeh use karte hain
│   ├── starting-items.json      shuru ki 54 items ki list (pehli baar hi use hoti hai)
│   ├── store.js                 orders aur items save karna
│   ├── email.js                 order email (fail ho to har 5 minute retry)
│   ├── catalog.js               live price list
│   ├── config.js                settings (UPI ID, email, passwords kahan se aate hain)
│   └── helpers.js               chhoti cheezein: phone/UTR check, Rs format
├── server.js                  dono panel ek saath start karta hai
├── setup.js                   computer par pehli baar password poochta hai
├── START-SHOP-WINDOWS.bat     Windows: double-click karke shop chalao
├── start-shop-mac.command     Mac: double-click karke shop chalao
└── package.json, package-lock.json, Procfile, app.json    Heroku ke liye
```

Is folder mein **koi password nahi hai**. Isliye ise GitHub par daalna safe hai.

## 1. Apne computer par chalao (Windows)

1. https://nodejs.org kholo, **LTS** wala button dabao, download karke install karo (Next, Next, Finish).
2. Zip file par right-click karo, **Extract All** dabao.
3. `doky-dory-shop` folder kholo aur **START-SHOP-WINDOWS.bat** par double-click karo.
   Agar Windows "Windows protected your PC" dikhaye to **More info**, phir **Run anyway** dabao.
4. Pehli baar kuch parts download honge (internet chahiye). Phir kaali window do cheezein poochegi:
   - **Admin panel ka password**: khud banao, kam se kam 8 letter/number. Typing ke time `*` dikhega.
   - **Gmail App Password**: abhi nahi hai to bas Enter dabao (neeche dekho kaise banta hai).
5. Browser mein dono panel apne aap khul jayenge:
   - Customer panel: http://localhost:3000
   - Admin panel: http://localhost:3000/admin
6. Kaali window **khuli rakho**. Use band karoge to shop band ho jayegi. Agli baar bas START file dobara double-click karo.

Mac par: `start-shop-mac.command` par right-click karke **Open** dabao. Baaki sab same.

**Dhyan do:** computer wala version sirf aapke computer par chalta hai (check karne aur apne use ke liye). Customers ko internet par site chahiye, uske liye step 3 (Heroku).

### Aapka data kahan save hota hai
`C:\Users\<aapka naam>\DokyDory-data` folder mein:
- `orders.json`: saare orders
- `catalog.json`: items, prices, delivery charge
- `item-photos`: aapki daali hui photos
- `settings.txt`: aapke passwords

Ye folder code ke **bahar** hai. Isliye ye galti se GitHub par nahi jayega, aur naya code aane par bhi orders aur items safe rahenge. Is folder ko kabhi upload ya share mat karna.

**Password badalna:** `settings.txt` par double-click (Notepad mein khulega). `ADMIN_PASSWORD=` ke baad naya password likho, save karo. Kaali window band karke START file dobara chalao. Gmail App Password bhi yahin `GMAIL_APP_PASSWORD=` ke baad daal sakte ho.

### Gmail App Password kaise banaye (order email ke liye)
1. **dokydoryofficial@gmail.com** se login karo.
2. https://myaccount.google.com/security par **2-Step Verification** ON karo.
3. https://myaccount.google.com/apppasswords kholo, naam `Doky Dory` likho, **Create** dabao.
4. 16-letter code copy karo. Ye code kisi ko mat bhejna, chat mein bhi nahi.

## 2. GitHub par upload karo

1. https://github.com par login karo. Upar right mein **+** dabao, phir **New repository**.
2. Repository name: `doky-dory-shop`. **Private** chuno. **Create repository** dabao.
3. Agle page par **uploading an existing file** link dabao.
4. `doky-dory-shop` folder ke **andar** jao, sab kuch select karo (Ctrl+A) aur browser mein drag karke chhod do.
   **`node_modules` folder mat daalna.** Ye computer par shop chalane se banta hai; select karte waqt ise chhod do (Ctrl dabake us par click karo).
5. Upload poora hone do, phir neeche **Commit changes** dabao.

## 3. Heroku par live karo (customers ke liye)

1. https://dashboard.heroku.com par **New**, phir **Create new app**.
2. **Deploy** tab: Deployment method **GitHub**, connect karo, `doky-dory-shop` repo chuno, **Deploy Branch** dabao.
3. **Resources** tab: **Heroku Postgres** add karo. Ye zaroori hai: isse orders hamesha safe rehte hain.
4. **Settings** tab: **Reveal Config Vars** dabao aur ye do daalo (khud type karo, chat mein kabhi mat bhejna):

| Key | Value |
| --- | --- |
| `GMAIL_APP_PASSWORD` | Gmail ka 16-letter App Password |
| `ADMIN_PASSWORD` | admin panel ka password |

   Chahein to: `DELIVERY_CHARGE` (shuru ka delivery charge, default 500), `UPI_ID` (default 9953791934.ibz@icici), `ORDER_EMAIL` (default dokydoryofficial@gmail.com), `SESSION_SECRET` (koi bhi lamba random text).
5. **Open app** dabao. Customer panel `/` par aur admin panel `/admin` par milega.
   `/healthz` kholo: `"ok": true`, `"storage": "postgres"` aur `"email": "ok"` dikhna chahiye. `"email": "failed"` aaye to App Password galat hai: naya banao aur Config Var update karo.

Heroku free nahi hai: Basic dyno + Postgres Essential-0 milake lagbhag $10 mahina.

## 4. Admin panel kaise use kare

Login 12 ghante chalta hai. 15 minute mein 10 galat password par wo device kuch der ke liye block. **Log out** se turant bahar.

- **Orders**: har order ka outlet name, amount, payment mode (UPI ka UTR, ya Other mein customer ne kya likha), aur email gaya ya nahi (Sent / Not sent). Outlet name, phone, order no ya UTR se search. Har order ke aage **PO** button se us order ka purchase order PDF. **Download backup (Excel)** se saare orders apne computer par.
- **Items & prices**:
  - **Add item**: naam, category, unit, price, photo.
  - List mein hi price badlo; Enter dabate hi save.
  - **Show** tick hatao to item customers se chhup jata hai (jaise stock khatam). Wapas tick karo to dikhne lagega.
  - **Edit**: naam, category, unit, price ya photo badlo.
  - **Delete**: item hamesha ke liye hata deta hai. Chhupana zyada behtar hai.
- **Settings**: har order ka delivery charge (jaise 500, ya free ke liye 0).

Har badlav turant lagta hai: customer shop kholte ya refresh karte hi naya dekhte hain, payment se pehle checkout prices dobara check karta hai, aur server har order ko isi list se check karta hai. Purane orders apni purani price par hi rehte hain.

UPI ID aur order email sirf `settings.txt` (computer) ya Heroku Config Vars mein badalte hain, taaki admin panel se koi payment ka UPI ID na badal sake.

## 5. Checkout mein customer kya bharta hai
- **Outlet name**, mobile number aur outlet ka address (zaroori); email aur GSTIN (optional).
- **Mode of payment**:
  - **UPI**: QR scan karke pay, phir UTR daalta hai. Aap bank app mein UTR aur amount milate ho.
  - **Other**: customer likhta hai kaise pay karega (jaise Cash on delivery, NEFT, Cheque). Iska UTR nahi hota. Email aur admin panel mein **Other** dikhega: dispatch se pehle client se payment confirm kar lena.
- Order ke baad customer **Download PO (PDF)** dabake purchase order le sakta hai (file ka naam `PO-<order no>.pdf`). Wahi PO aap admin panel se bhi nikal sakte ho.

## 6. Orders safe kaise rehte hain
- Har order email bhejne se **pehle** save hota hai. Email na aaye to bhi admin panel mein dikhega, aur email har 5 minute dobara try hoti hai (3 din tak).
- Prices server par list se calculate hoti hain, customer browser se price nahi badal sakta.
- "Place order" do baar dabane ya net jaane par bhi order double nahi banta.
- Ek UTR sirf ek order par chalta hai.
- Mobile number, UTR aur GSTIN save se pehle check hote hain.
- Payment ke beech price badal gayi ho to email aur admin panel mein **Check** note aata hai, taaki aap mila sako kitna paisa aaya.
- Customer **My orders** mein order number aur mobile number se purana order aur uska PO nikal sakta hai.

## Logo
`customer-panel/public/logo.png`, `logo@2x.png`, `logo-white.png` (PO aur email mein). Inhe badalne se logo badal jayega.
