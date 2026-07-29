CHANGES AND FIXES  

1. When Skip to Products is clicked, it shows only 24 out of 36 products in the 'ALL Sports' section. Change to show all the products.
  - **Done:** Browse `pageSize` is 100 so All Sports lists the full catalog.
2. Change the button to "Skip All" from "Skip to Products".
  - **Done:** Control label is **Skip All**.
3. Make a "Skip this step" button also in Grey to skip the current question and moving to the next question in the questionnaire so that only those options are clicked which are deemed necessary by the user.
  - **Done:** Grey **Skip this step** clears the current answer and advances to the next question.
4. In "all sports" catalogue, whether I select 45-55 or 55+, and update recommendations, it shows 24 out of 36 products displayed. Correct the logic of product display here.
  - **Done:** Same page-size / catalog listing fix as (1).
5. Equipment, Clothing, Footwear and Accessories do not include all the products. Their total is upto 31 products only. Create the category of the products left.
  - **Done:** Added **Support** and **Fitness technology** landings/nav for remaining catalog rows.
6. Whenever the guest login is merged with sign in/ sign up, whatever is in the cart, there will be 1 item but the quantity will be increased to 3 instead of 1. 
  - **Done:** Guest→account merge uses a per-user mutex and sets Express cart lines to absolute guest quantities (no stacked `addToCart`). See Phase 08 auth notes.
7. If I skip any step in the questionnaire, it directly ignores the rest which was selected and lands on All Products page.
  - **Done:** Skipping individual steps keeps other answers. Finish with any answered fields builds preferences (soft defaults for skipped required fields) and goes to **Recommendations**. Only **Skip All** or a fully empty quiz goes to All Products (`/browse`).
8. Product images are not showing.
  - **Done:** Keep real sheet URLs (do not split on `/`); reject `example.com` placeholders and substitute category stock photos; UI `ProductImage` uses `referrerPolicy="no-referrer"` and `/placeholder-product.svg` on error. See Phase 02 ingestion / data-model.
