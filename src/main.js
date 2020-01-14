import "regenerator-runtime/runtime";
import App from './App.svelte';
import data from "./sample.cm.json"
const app = new App({
	target: document.querySelector('#salaryIndex'),
	props: {
		name: 'world',
		data: document.querySelector("#salary-data-json #salary-json-string").textContent
		// data: JSON.stringify(data)
	}
});

export default app;