<script>
  export let name;
  import Comp from "./comp.svelte";
  import { onMount } from "svelte";
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
  let shouldSearch = false;
  let type = null;
  let finishTime = null;
  let all_categories = [];
  let all_locations = [];
  let all_jobType = [];
  let sortFilter = "median_high";
  let jobCount = {};

  const cleanArr = arr => arr.filter(i => i.length);
  function setCSV(e) {
    const parsedData = JSON.parse(
      document.querySelector("#salary-data-json #slary-json-string").innerText
    );
    all_jobs = parsedData
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

  function hasValue(x) {
    return Boolean(x && x.length && !/null|undefinde/.test(x));
  }

  function search() {
    if (!shouldSearch) return;
    const start = window.performance.now();
    result = all_jobs
      .filter(job => {
        const conditions = [];
        let match = true;
        const hasQuery = hasValue(query);
        const hasJobType = hasValue(jobType);
        const hasJobLocation = hasValue(jobLocation);
        const hasJobCategory = hasValue(jobCategory);
        // match all if no filters selected !
        if (!hasQuery && !hasJobType && !hasJobLocation & !hasJobCategory) {
          return true;
        }
        if (hasJobLocation) {
          match = jobLocation === job.location;
        }
        if (hasJobCategory && match) {
          match = jobCategory === job.category;
        }
        if (hasJobType && match) {
          match = jobType === job.job_type;
        }
        if (hasQuery && match) {
          if (twoWayMatch(query, job.job_title)) match = true;
          else match = false;
        }
        return match;
      })
      .sort(_sortHandler);
    finishTime = (window.performance.now() - start).toFixed(5);
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

  function matchFilter(arr = [], val = "") {
    return arr.some(i => i.length && twoWayMatch(i, val));
  }

  onMount(() => {
    setCSV();
    console.log("the component has mounted");
  });

  function startSearch() {
    shouldSearch = true;
    search();
  }

  function formatCasing(str) {
    return str.length && str.length < 4
      ? str.toUpperCase()
      : str[0].toUpperCase() + str.slice(1);
  }
</script>

<style>
  .search {
    display: flex;
    position: relative;
  }
  .filters > div {
    display: grid;
    grid-template-columns: minmax(auto, 12px) auto;
    grid-column-gap: 8px;
  }
  .results-container {
    display: block;
  }
  .search-container {
    background: #efefef;
    padding: 10px;
  }
  input,
  select {
    padding: 15px 10px;
    width: 100%;
    border: 0;
    margin: 5px;
  }
  input {
    margin: 5px 0 5px 5px;
  }
  label.wrap {
    overflow: hidden;
    position: relative;
    width: 100%;
  }

  select.dropdown {
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
  }
  label.wrap:after {
    content: "\f107";
    font-family: FontAwesome;
    position: absolute;
    right: 0;
    top: 22px;
    z-index: 1;
    width: 10%;
    height: 100%;
    pointer-events: none;
  }
  button {
    position: relative;
    background: none;
    color: #fff;
    padding: 15px;
    margin: 5px;
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    border: 0;
  }
  button::before {
    content: "";
    background: #00bed4;
    position: absolute;
    top: 0;
    right: 0;
    width: 100%;
    height: 100%;
  }
  .job-location {
    text-transform: capitalize;
  }
  .abbriviated {
    text-transform: uppercase;
  }
  .captalized {
    text-transform: capitalize;
  }
</style>

<Comp />
<div class="search-container">
  <div class="search">
    <input placeholder="Job Title" type="text" on:input={searchQuery} />
    <label class="wrap">
      <select
        class="dropdown"
        bind:value={selectedJobType}
        on:change={filterJobType}>
        <option value="null" selected disabled>Job Type</option>
        <option value={null}>All Job Types</option>
        {#each all_jobType as jobt, i}
          <option id={jobt} value={jobt} selectedJobType={jobType}>
             {formatCasing(jobt)}
          </option>
        {/each}
      </select>
    </label>
    <label class="wrap">
      <select
        class="dropdown"
        bind:value={selectedJobCategory}
        on:change={filterJobCategory}>
        <option value="null" selected disabled>Job Category</option>
        <option value={null}>All Categories</option>
        {#each all_categories as cat, i}
          <option id={cat} value={cat} selectedJobCategory={jobCategory}>
             {formatCasing(cat)}
          </option>
        {/each}
      </select>
    </label>
    <label class="wrap">
      <select
        class="dropdown"
        bind:value={selectedJobLocation}
        on:change={filterJobLocation}>
        <option value="null" selected disabled>Location</option>
        <option value={null}>All Job Locations</option>
        {#each all_locations as loc, i}
          <option id={loc} value={loc} selectedJobLocation={jobLocation}>
             {formatCasing(loc)}
          </option>
        {/each}
      </select>
    </label>
    <button on:click={startSearch}>
      <i class="fa fa-search" />
    </button>
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
              <div class="job-title"> {job_title} </div>
              of
              <div class="job-type">{job_type}</div>
              in
              <div class="job-category">{category}</div>
              in
              <div
                class="job-location {location.length && location.length < 4 ? 'abbriviated' : null}">
                 {location}
              </div>
              for
              <div class="job-range">{permanent_low}-{permanent_high}</div>
            </li>
          {:else}Nothing to Show{/each}
        </ol>
      {:else if result === null && all_jobs}
        <span />
      {:else}
        <p>No results found for your search!</p>
      {/if}
    </div>
  </div>
</div>
