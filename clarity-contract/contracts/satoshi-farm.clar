;; SatoshiFarm - Decentralized Farmers Marketplace on Stacks Blockchain
;; Harvest your sats like a true Bitcoin farmer!

(define-data-var next-item-id uint u1)

(define-map satoshi-farm-items uint 
  { name: (string-ascii 100), 
    description: (string-ascii 200), 
    price: uint, 
    quantity: uint, 
    seller: principal, 
    active: bool })

(define-map seller-sats principal uint)  ;; Accumulated earnings per seller - ready for harvest

;; List a new item for sale - plant your produce in the marketplace!
(define-public (list-item (name (string-ascii 100)) (description (string-ascii 200)) (price uint) (quantity uint))
  (begin
    ;; Validate inputs - no free lunches or empty fields
    (asserts! (> (len name) u0) (err u101))
    (asserts! (> (len description) u0) (err u101))
    (asserts! (> price u0) (err u101))
    (asserts! (> quantity u0) (err u101))
    (let ((item-id (var-get next-item-id)))
      ;; Plant the item in our marketplace map
      (map-set satoshi-farm-items item-id 
        {name: name, description: description, price: price, quantity: quantity, seller: tx-sender, active: true})
      ;; Increment the item ID for the next farmer
      (var-set next-item-id (+ item-id u1))
      (ok item-id))))

;; Buy items - direct payment to farmer's wallet
(define-public (buy-item (item-id uint) (quantity-to-buy uint))
  (let ((item (unwrap! (map-get? satoshi-farm-items item-id) (err u102)))
        (total-cost (* (get price item) quantity-to-buy)))
    ;; Ensure item is active and has enough quantity
    (asserts! (get active item) (err u102))
    (asserts! (>= (get quantity item) quantity-to-buy) (err u103))
    ;; Transfer STX directly from buyer to seller
    (try! (stx-transfer? total-cost tx-sender (get seller item)))
    (let ((new-quantity (- (get quantity item) quantity-to-buy))
          (seller (get seller item)))
      ;; Update item quantity and deactivate if sold out
      (map-set satoshi-farm-items item-id (merge item {quantity: new-quantity, active: (> new-quantity u0)}))
      ;; Add earnings to seller's sats balance for tracking
      (map-set seller-sats seller (+ (default-to u0 (map-get? seller-sats seller)) total-cost))
      (ok true))))

;; Harvest your sats - get accumulated earnings amount (STX already transferred directly)
(define-public (harvest-sats)
  (let ((sats (default-to u0 (map-get? seller-sats tx-sender))))
    ;; Only farmers with earnings can harvest
    (asserts! (> sats u0) (err u104))
    ;; Reset balance to zero - fresh start for next harvest
    (map-delete seller-sats tx-sender)
    (ok sats)))

;; Read-only functions - check the marketplace without planting or harvesting

(define-read-only (get-item (item-id uint))
  (map-get? satoshi-farm-items item-id))

(define-read-only (get-next-item-id)
  (var-get next-item-id))

(define-read-only (get-seller-sats (seller principal))
  (default-to u0 (map-get? seller-sats seller)))