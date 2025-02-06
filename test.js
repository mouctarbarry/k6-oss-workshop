import http from "k6/http";

export const options = {
    stages: [
        { target: 200, duration: "1m" },
        { target: 200, duration: "3m" },
        { target: 0, duration: "1m" }
    ],
}

export default function () {
    const res = http.get("https://test.k6.io");
}