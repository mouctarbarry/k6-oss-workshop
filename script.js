import http from "k6/http";
import {SharedArray} from "k6/data";
import exec from 'k6/execution';
import {check} from "k6";

export const options = {
    stages: [
        {duration: "5s", target: 5},
        {duration: "10", target: 10},
        {duration: "5s", target: 0},
    ],
    thresholds: {
        "http_req_duration": ["p(95)<5000"],
    },
}

// Add this line after the options block, outside the default function, as we want to load the data only once.
const customers = new SharedArray('all my customers', function () {
    return JSON.parse(open('./customers.json')).customers;
});

// console.log(`customers list : ${JSON.stringify(customers)}`);

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
                // "X-User-ID": customers[Math.floor(Math.random() * customers.length)],
                "X-User-ID": customers[(exec.vu.idInTest - 1) % customers.length], // ensure each VU has a unique customer by using the VU ID as an index
                "Authorization": "Token su33XkStXefPhrPn",
            },
        });

    // console.log(exec.vu.idInTest, customers[ (exec.vu.idInTest - 1) % customers.length]);

  check(res, {
        "status is 200": (r) => r.status === 200,
  })

    if (res.status === 200) {
        let jsonResponse = res.json();
        if (jsonResponse && jsonResponse.pizza) {
            //  console.log(`${jsonResponse.pizza.name} (${jsonResponse.pizza.ingredients.length} ingredients)`);
        } else {
            console.error("Invalid JSON response");
        }
    } else {
        console.error(`Request failed with status ${res.status}`);
    }

    console.log(`Execution context
      
      Instance info
      -------------
      Vus active: ${exec.instance.vusActive}
      Iterations completed: ${exec.instance.iterationsCompleted}
      Iterations interrupted:  ${exec.instance.iterationsInterrupted}
      Iterations completed:  ${exec.instance.iterationsCompleted}
      Iterations active:  ${exec.instance.vusActive}
      Initialized vus:  ${exec.instance.vusInitialized}
      Time passed from start of run(ms):  ${exec.instance.currentTestRunDuration}
      
      Scenario info
      -------------
      Name of the running scenario: ${exec.scenario.name}
      Executor type: ${exec.scenario.executor}
      Scenario start timestamp: ${exec.scenario.startTime}
      Percentage complete: ${exec.scenario.progress}
      Iteration in instance: ${exec.scenario.iterationInInstance}
      Iteration in test: ${exec.scenario.iterationInTest}
      
      Test info
      ---------
      All test options: ${exec.test.options}
      
      VU info
      -------
      Iteration id: ${exec.vu.iterationInInstance}
      Iteration in scenario: ${exec.vu.iterationInScenario}
      VU ID in instance: ${exec.vu.idInInstance}
      VU ID in test: ${exec.vu.idInTest}
      VU tags: ${exec.vu.metrics.tags}`);
}


export function handleSummary(data) {
    return {
        'summary.json': JSON.stringify(data),
    };
}