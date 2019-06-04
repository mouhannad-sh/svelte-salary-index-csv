<script>
  export let name;
  import csv from "csvtojson/browser/browser.js";
  import Comp from "./comp.svelte";
  import { onMount } from "svelte";
  const headers = [
    "job_title",
    "job_type",
    "category",
    "location",
    "permanent_low",
    "permanent_high",
    "contract_low",
    "contract_high"
  ];
  let all_jobs = null;
  let result = null;
  let query = "";
  let queryMirror = "";
  let selectedJobType;
  let selectedJobCategory;
  let selectedJobLocation;
  let location = [];
  let category = [];
  let jobType = null;
  let jobCategory = null;
  let jobLocation = null;
  let type = null;
  let finishTime = null;
  let all_categories = [];
  let all_locations = [];
  let all_jobType = [];
  let sortFilter = "median_high";
  let jobCount = {};

  const cleanArr = arr => arr.filter(i => i.length);
  async function setCSV(e) {
    const parsedData = JSON.parse(
      document.querySelector("#salary-data-json #slary-json-string").innerText
    );
    result = all_jobs = parsedData
      .filter(({ category }) => category)
      .map(item => {
        Object.keys(item).forEach(key => {
          item[key] = item[key].toLowerCase();
        });
        return item;
      });
    all_categories = all_jobs.reduce((acc, { category: cat }) => {
      if (!cat || acc.includes(cat.toLowerCase())) return acc;
      return acc.concat(cat.toLowerCase());
    }, []);
    all_locations = all_jobs.reduce((acc, { location: loc }) => {
      if (!loc || acc.includes(loc.toLowerCase())) return acc;
      return acc.concat(loc.toLowerCase());
    }, []);
    all_jobType = all_jobs.reduce((acc, { job_type: jobt }) => {
      if (!jobt || acc.includes(jobt.toLowerCase())) return acc;
      return acc.concat(jobt.toLowerCase());
    }, []);
    // updateCounters();
  }

  function searchQuery(e) {
    const val = e.target.value.toLowerCase();
    if (!all_jobs) return;
    query = val;
    search();
  }

  function filterJobLocation(e) {
    jobLocation = e.target.value;
    search();
  }

  function filterJobCategory(e) {
    jobCategory = e.target.value;
    search();
  }

  function filterJobType(e) {
    jobType = e.target.value;
    search();
  }

  function search() {
    const start = window.performance.now();
    result = all_jobs
      .filter(job => {
        const conditions = [];
        let match = true;
        const sanitised_jobType = jobType;
        const sanitised_jobCategory = jobCategory;
        const sanitised_jobLocation = jobLocation;
        if (twoWayMatch(query, job.job_title)) match = true;

        if (sanitised_jobLocation) {
          match = sanitised_jobLocation === job.location;
        }
        if (sanitised_jobCategory && match) {
          match = sanitised_jobCategory === job.category;
        }
        if (sanitised_jobType && match) {
          match = sanitised_jobType === job.job_type;
        }
        return match;
      })
      .sort(_sortHandler);
    finishTime = (window.performance.now() - start).toFixed(5);
    // updateCounters("result");
  }

  function twoWayMatch(a = "", b = "") {
    a = a.toLowerCase();
    b = b.toLowerCase();
    return a.includes(b) || b.includes(a);
  }
  function median(values) {
    values.sort(function(a, b) {
      return a - b;
    });
    var half = Math.floor(values.length / 2);

    if (values.length % 2) return values[half];
    else return (values[half - 1] + values[half]) / 2.0;
  }
  function sortBySalary(e) {
    const start = window.performance.now();
    let val = e.target.value;
    sortFilter = val;

    if (!result) return;
    result = result.sort(_sortHandler);
    finishTime = (window.performance.now() - start).toFixed(5);
  }

  function _sortHandler(a, b) {
    const lowA = parseInt(a.permanent_low.replace("k", "000"));
    const lowB = parseInt(b.permanent_low.replace("k", "000"));
    const highA = parseInt(a.permanent_high.replace("k", "000"));
    const highB = parseInt(b.permanent_high.replace("k", "000"));
    const medianA = median([lowA, highA]);
    const medianB = median([lowB, highB]);
    switch (sortFilter) {
      case "low_low":
        return lowA > lowB ? 1 : -1;
      case "high_low":
        return lowA < lowB ? 1 : -1;
      case "low_high":
        return highA > highB ? 1 : -1;
      case "high_high":
        return highA < highB ? 1 : -1;
      case "median_low":
        return medianA > medianB ? 1 : -1;
      case "median_high":
        return medianA < medianB ? 1 : -1;
      default:
        return;
    }
  }

  // function updateCounters(type = "all_jobs") {
  //   new Promise(resolve => {
  //     const counts = {};
  //     const buildCounts = ({ category, location, job_type }) => {
  //       category = category.toLowerCase();
  //       location = location.toLowerCase();
  //       job_type = job_type.toLowerCase();
  //       counts[`cat_${category}`] = ++counts[`cat_${category}`] || 1;
  //       counts[`loc_${location}`] = ++counts[`loc_${location}`] || 1;
  //       counts[`jobt_${job_type}`] = ++counts[`jobt_${job_type}`] || 1;
  //     };
  //     if (type === "all_jobs") {
  //       all_jobs.forEach(buildCounts);
  //     } else if (type === "result") {
  //       if (result.length) {
  //         result.forEach(buildCounts);
  //       } else {
  //         all_jobs.array.forEach(element => {

  //         });
  //       }
  //     }
  //     console.log(result, type, counts);
  //     jobCount = counts;
  //     resolve();
  //   });
  // }

  function matchFilter(arr = [], val = "") {
    return arr.some(i => i.length && twoWayMatch(i, val));
  }

  onMount(() => {
    setCSV();
    console.log("the component has mounted");
  });
</script>

<style>
  h1 {
    color: green;
  }
  teal {
    color: teal;
  }
  .search {
    display: block;
    margin-bottom: 20px;
  }
  .filters > div {
    display: grid;
    grid-template-columns: minmax(auto, 12px) auto;
    grid-column-gap: 8px;
  }
  .results-container {
    display: block;
  }
</style>

<Comp />
<div class="search">
  <input placeholder="Job Title" type="text" on:input={searchQuery} />
  <select bind:value={selectedJobType} on:change={filterJobType}>
    <option value="null" selected disabled>Job Type</option>
    {#each all_jobType as jobt, i}
      <option id={jobt} value={jobt} selectedJobType={jobType}> {jobt} </option>
    {/each}
  </select>
  <select bind:value={selectedJobCategory} on:change={filterJobCategory}>
    <option value="null" selected disabled>Category</option>
    {#each all_categories as cat, i}
      <option id={cat} value={cat} selectedJobCategory={jobCategory}>
         {cat}
      </option>
    {/each}
  </select>
  <select bind:value={selectedJobLocation} on:change={filterJobLocation}>
    <option value="null" selected disabled>Location</option>
    {#each all_locations as loc, i}
      <option id={loc} value={loc} selectedJobLocation={jobLocation}>
         {loc}
      </option>
    {/each}
  </select>
</div>
<div class="results-container">

  <div class="results">
    {#if result}
      <p>
        Found {result.length} results! in {all_jobs.length} during {finishTime}
        milliseconds
      </p>
      <ol>
        {#each result as { job_title, job_type, category, location, permanent_high, permanent_low }, i}
          <li>
            <teal>
              <b>{job_title}</b>
            </teal>
            of
            <b>{job_type}</b>
            in
            <b>{category}</b>
            in
            <b>{location}</b>
            for
            <b>{permanent_low}-{permanent_high}</b>
          </li>
        {:else}Nothing to Show{/each}
      </ol>
    {:else if result === null && all_jobs === null}
      <p>You need to upload a CSV first!</p>
    {:else if result === null && all_jobs}
      <p>Type to search!</p>
    {:else}
      <p>No results found for your search!</p>
    {/if}
  </div>
</div>
