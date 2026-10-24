Feature: E-commerce flow

  @manual
  Scenario: Login, add product to cart and verify
    Given I open demoblaze
    When I login with configured credentials
    And I add product "Samsung galaxy s6" to the cart
    And I go to the cart
    Then I see product "Samsung galaxy s6" in the cart
