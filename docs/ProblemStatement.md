Problem Statement: # Problem Statement: Personalized Sports Equipment Recommendation System for Users Aged 45+

You are tasked with building a personalized sports equipment shopping and recommendation platform inspired by Decathlon. The platform should help users aged 45 and above discover suitable sports equipment without experiencing cognitive overload from too many product choices.

The system should intelligently recommend products based on user preferences such as age group, sport, experience level, budget, and product category. It should combine structured inventory data with a rule-based recommendation engine to generate clear and relevant product suggestions.

## Objective

Design and implement an application that:

* Takes user preferences such as age, sport, budget, experience level, and product type.
* Uses a real-world or manually created inventory dataset of sports products.
* Applies rule-based filtering and weighted scoring to generate personalized recommendations.
* Reduces decision fatigue by showing a limited number of relevant products.
* Allows users to view products, add items to the cart, complete checkout, and place an order.
* Displays clear and useful product recommendations with explanations.

# System Workflows

## 1. Data Ingestion

* Load and preprocess the sports equipment inventory from a Google Sheet.

* Use a local JSON, CSV, or Excel file as a fallback if the Google Sheets connection is unavailable.

* Extract relevant product fields such as:

  * Product name
  * Brand
  * Sport
  * Product category
  * Product subcategory
  * Age suitability
  * Experience level
  * Price
  * Rating
  * Stock quantity
  * Product benefits
  * Product tags
  * Product image
  * Product description

* Clean and standardize values such as sports names, product types, price ranges, and age groups.

* Remove inactive, invalid, or duplicate products.

* Ensure that out-of-stock products are not included in recommendations.

## 2. User Input

Collect user preferences through a simple, multi-step questionnaire.

The questionnaire should capture:

* Age group:

  * 45–55 years
  * 55+ years

* Primary sport:

  * Walking
  * Trekking
  * Hiking
  * Badminton
  * Table Tennis
  * Yoga
  * Pickleball
  * Golf
  * Paddleball
  * Camping
  * Cycling

* Additional sports of interest

* Product type:

  * Equipment
  * Clothing
  * Footwear
  * Accessories
  * Support and recovery
  * Fitness technology

* Experience level:

  * Beginner
  * Intermediate
  * Experienced

* Budget range

* Any additional preference, such as:

  * Lightweight
  * Beginner-friendly
  * Easy to use
  * High cushioning
  * Wide fit
  * Non-slip
  * Portable
  * Comfort-focused
  * Weather-resistant

The questionnaire should be displayed as an overlay with one question per step to reduce cognitive overload.

## 3. Integration Layer

* Receive questionnaire responses from the frontend.

* Send the responses to the backend through a POST API.

* Fetch inventory data from Google Sheets or the local fallback file.

* Normalize product data into a consistent format.

* Apply hard filters based on:

  * Product availability
  * Selected sport
  * Selected product type
  * Age suitability
  * Experience level
  * Budget range

* Pass the eligible products to the recommendation scoring module.

* Return ranked products and recommendation explanations to the frontend.

## 4. Recommendation Engine

Use a deterministic rule-based recommendation engine instead of an LLM for the MVP.

The recommendation engine should:

* Remove products that do not meet mandatory user requirements.
* Assign weighted scores to eligible products.
* Rank products from highest to lowest relevance.
* Ensure diversity among recommended products.
* Generate a simple explanation for each recommendation.

### Example Scoring Logic

* Primary sport match: +40 points
* Additional sport match: +15 points
* Exact age-group match: +20 points
* Suitable for all users aged 45+: +10 points
* Exact experience-level match: +15 points
* Product-type match: +15 points
* Product within budget: +10 points
* Beginner-friendly tag for beginner users: +10 points
* Lightweight tag for users aged 55+: +8 points
* Easy-to-use tag for users aged 55+: +8 points
* Comfort-focused tag: +6 points
* Rating of 4 or above: +5 points
* Featured product: +3 points

The final score should be calculated as:

```text
Recommendation Score =
Sport Score
+ Age Score
+ Experience Score
+ Product Type Score
+ Budget Score
+ Benefit Score
+ Rating Score
+ Featured Score
```

The system should display:

* Up to six primary recommendations
* Up to four additional recommendations
* Up to three relevant accessories

The recommendation engine should avoid:

* Showing too many products
* Recommending duplicate product variants
* Showing more than three products from the same subcategory
* Showing more than two products from the same brand
* Recommending unavailable products

## 5. Recommendation Explanation

The system should generate template-based explanations for each recommended product.

Examples:

* “Recommended because it matches your interest in walking and is suitable for beginners.”
* “A lightweight and easy-to-use option for users aged 55+.”
* “Fits your selected budget and provides comfort-focused features.”
* “Suitable for both trekking and hiking.”
* “Recommended as an accessory to support your selected sport.”

The explanation should be short, simple, and easy to understand.

## 6. Product Discovery and Shopping Flow

The complete application flow should be:

Opening Page
→ Login or Continue as Guest
→ Questionnaire Overlay
→ Personalized Recommendations
→ Rule-Based Product Ranking
→ Product Details
→ Add to Cart or Buy Now
→ Cart
→ Checkout
→ Payment Page
→ Payment Gateway or Mock Payment
→ Order Confirmation

The user should be able to complete the entire journey without creating an account.

## 7. Product Categories and Tags

Products should be classified using multiple tags.

### Sports Tags

* Walking
* Trekking
* Hiking
* Badminton
* Table Tennis
* Yoga
* Pickleball
* Golf
* Paddleball
* Camping
* Cycling

### Product Category Tags

* Equipment
* Clothing
* Footwear
* Accessories
* Support
* Fitness technology

### Age Tags

* Age 45–55
* Age 55+
* Suitable for all users aged 45+

### Price Tags

* Low budget
* Medium budget
* High budget

### Product Benefit Tags

* Lightweight
* Beginner-friendly
* Easy to use
* High cushioning
* Wide fit
* Low impact
* Portable
* Ergonomic grip
* Non-slip
* Adjustable
* Compact
* Comfort-focused
* Weather-resistant

### Accessory Tags

* Water bottle
* Fitness watch
* Knee support
* Cap
* Gloves
* Socks
* Backpack
* Protective gear
* Hydration
* Recovery

## 8. Backend and API Layer

The backend should expose REST APIs using GET and POST methods.

### Product APIs

* `GET /api/products`

  * Fetch products
  * Support search, filtering, sorting, and pagination

* `GET /api/products/:id`

  * Fetch complete details of a selected product

### Recommendation API

* `POST /api/recommendations`

  * Accept user preferences
  * Filter and rank products
  * Return personalized recommendations

### Cart APIs

* `GET /api/cart/:sessionId`
* `POST /api/cart`
* `POST /api/cart/update`
* `POST /api/cart/remove`

### Order APIs

* `POST /api/orders`
* `GET /api/orders/:orderId`

### Payment APIs

* `POST /api/payments/create`
* `POST /api/payments/confirm`

## 9. Inventory Architecture

The backend should connect to a Google Sheet that acts as the inventory database.

The inventory should contain fields such as:

* Product ID
* Product name
* Brand
* Sport
* Product category
* Product subcategory
* Age group
* Experience level
* Price
* Price range
* Stock quantity
* Rating
* Review count
* Description
* Product benefits
* Product tags
* Product images
* Sizes
* Colors
* Active status
* Featured status

The inventory should also be available in:

* Excel format
* CSV format
* JSON format

The local JSON file should be used as a fallback if the Google Sheets API is unavailable.

## 10. Output Display

Present top recommendations in a simple and user-friendly format.

Each recommendation should display:

* Product image
* Product name
* Brand
* Sport
* Product category
* Price
* Rating
* Main product benefit
* Availability
* Personalized recommendation explanation
* View Product button
* Add to Cart button

The recommendation page should also include:

* “Why these products?” section
* Option to refine preferences
* Related accessories
* Closest alternatives when no exact match is available

## 11. User Interface Requirements

The frontend should be designed specifically for users aged 45 and above.

The interface should use:

* Large readable fonts
* High-contrast text
* Large buttons
* Clear navigation
* One question per questionnaire screen
* Limited product options
* Simple product descriptions
* Visible labels
* Minimal animations
* Clear error and confirmation messages

The interface should avoid:

* Too many banners
* Small text
* Crowded screens
* Icon-only actions
* Excessive animations
* Long technical descriptions
* Too many recommendation cards on one screen

## 12. Expected Outcome

The final application should allow a user aged 45 or above to:

1. Enter the platform as a guest or registered user.
2. Select their age group, sport, budget, experience level, and product preferences.
3. Receive a limited list of suitable sports products.
4. Understand why each product has been recommended.
5. View product details in simple language.
6. Add a product to the cart.
7. Complete checkout and mock payment.
8. View an order confirmation page.

The MVP should demonstrate how structured inventory data and rule-based personalization can reduce decision fatigue and improve the online sports equipment shopping experience for users aged 45 and above.
