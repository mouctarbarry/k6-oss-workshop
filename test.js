import http from "k6/http";

export const options = {
  stages: [
    { duration: "5s", target: 10 },
    { duration: "10s", target: 10 },
    { duration: "5s", target: 0 },
  ],
  thresholds: {
    "http_req_duration": ["p(95)<5000"],
  },
}

const BASE_URL = __ENV.BASE_URL || "http://localhost:3333";

export default function () {
  let restrictions = {
    maxCaloriesPerSlice: 500,
    mustBeVegetarian: false,
    excludedIngredients: ["pepperoni"],
    excludedTools: ["knife"],
    maxNumberOfToppings: 6,
    minNumberOfToppings: 2,
  };
  let res = http.post(
      `${BASE_URL}/api/pizza`,
      JSON.stringify(restrictions),
      {
        headers: {
          "Content-Type": "application/json",
         // "X-User-ID": 23423,
          "Authorization": "Token MOcliGa9T0VajY0J",
        },
      });

  if (res.status === 200) {
    let jsonResponse = res.json();
    if (jsonResponse && jsonResponse.pizza) {
      console.log(`${jsonResponse.pizza.name} (${jsonResponse.pizza.ingredients.length} ingredients)`);
    } else {
      console.error("Invalid JSON response");
    }
  } else {
    console.error(`Request failed with status ${res.status}`);
  }
}

export function handleSummary(data){
  return {
    'summary.json': JSON.stringify(data),
  };
}