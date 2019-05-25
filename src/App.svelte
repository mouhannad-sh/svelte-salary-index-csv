<script>
  export let name;
  import csv from "csvtojson/browser/browser.js";
  import Comp from "./comp.svelte";
  const headers = [
    "job_title",
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
  let location = [];
  let category = [];
  let type = null;
  let finishTime = null;
  let all_categories = [];
  let all_locations = [];
  let sortFilter = "median_high";
  let jobCount = {};

  const cleanArr = arr => arr.filter(i => i.length);
  async function setCSV(e) {
    const fd = new FileReader();
    const promise = new Promise(resolve => {
      fd.onloadend = () => resolve(fd.result);
    });
    fd.readAsText(e.target.files[0]);
    result = all_jobs = await (await csv({
      headers,
      colParser: {
        category: item => item.toLowerCase(),
        location: item => item.toLowerCase()
      }
    }).fromString(await promise)).filter(j => j.category && j.location);

    all_categories = all_jobs.reduce((acc, { category: cat }) => {
      if (acc.includes(cat.toLowerCase())) return acc;
      return acc.concat(cat.toLowerCase());
    }, []);
    all_locations = all_jobs.reduce((acc, { location: loc }) => {
      if (acc.includes(loc.toLowerCase())) return acc;
      return acc.concat(loc.toLowerCase());
    }, []);
    updateCounters();
  }

  function searchQuery(e) {
    const val = e.target.value.toLowerCase();
    if (!all_jobs) return;
    query = val;
    search();
  }

  function searchLocation(e) {
    const val = e.target.value.toLowerCase();
    if (!all_jobs) return;
    console.log(val.split(","));
    location = val.split(",");

    search();
  }

  function searchCategory(e) {
    const val = e.target.value.toLowerCase();
    if (!all_jobs) return;
    category = val.split(",").filter(i => i.length);
    search();
    updateCounters("result");
  }

  function filterLocation(e) {
    const val = e.target.value;
    const checked = e.target.checked;
    if (checked) {
      location = location.concat(val);
    } else {
      location = location.filter(l => l !== val);
    }
    search();
  }

  function filterCategory(e) {
    const val = e.target.value;
    const checked = e.target.checked;
    if (checked) {
      category = category.concat(val);
    } else {
      category = category.filter(c => c !== val);
    }
    search();
  }

  function search() {
    const start = window.performance.now();
    result = all_jobs
      .filter(job => {
        const conditions = [];
        let match = false;
        const sanitised_locations = cleanArr(location);
        const sanitised_categories = cleanArr(category);
        if (twoWayMatch(query, job.job_title)) match = true;
        if (sanitised_locations.length) {
          // if we have a location value but don't have a match, then falsify the match
          if (!sanitised_locations.some(l => twoWayMatch(l, job.location)))
            match = false;
        }
        if (sanitised_categories.length) {
          if (!sanitised_categories.some(c => twoWayMatch(c, job.category)))
            match = false;
        }
        return match;
      })
      .sort(_sortHandler);
    finishTime = (window.performance.now() - start).toFixed(5);
    updateCounters("result");
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

  function updateCounters(type = "all_jobs") {
    new Promise(resolve => {
      const counts = {};
      const buildCounts = ({ category, location }) => {
        category = category.toLowerCase();
        location = location.toLowerCase();
        counts[`cat_${category}`] = ++counts[`cat_${category}`] || 1;
        counts[`loc_${location}`] = ++counts[`loc_${location}`] || 1;
      };
      if (type === "all_jobs") {
        all_jobs.forEach(buildCounts);
      } else if (type === "result") {
        result.forEach(buildCounts);
        if (type === "result") {
          if (cleanArr(category).length || cleanArr(location).length) {
            all_categories.forEach(cat => {
              const filt = all_jobs.filter(
                job =>
                  (cleanArr(location).length
                    ? location.includes(job.location)
                    : true) && cat === job.category
              );
              counts[`cat_${cat}`] = filt.length;
            });

            all_locations.forEach(loc => {
              const filt = all_jobs.filter(
                job =>
                  (cleanArr(category).length
                    ? category.includes(job.category)
                    : true) && loc === job.location
              );
              counts[`loc_${loc}`] = filt.length;
            });
          }
        }
      }
      jobCount = counts;
      resolve();
    });
  }

  function matchFilter(arr = [], val = "") {
    return arr.some(i => i.length && twoWayMatch(i, val));
  }

  $: queryMirror = query + `...oh yah.. I'm derived !`;

  $: document.title = query;
</script>

<style>
  h1 {
    color: purple;
  }
  red {
    color: red;
  }
  blue {
    color: blue;
  }
  green {
    color: green;
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
  .filters label span {
    color: #8c8c8c;
    font-size: 11px;
  }
  .results-container {
    display: grid;
    grid-template-columns: 1fr 3fr;
  }
</style>

<Comp />
<h1>Choose a salary index CSV to see some magic</h1>
<h1>{queryMirror}</h1>
<input type="file" on:change={setCSV} />
<div class="search">
  <input type="text" on:input={searchQuery} />
  <input type="text" value={location} on:input={searchLocation} />
  <input type="text" on:input={searchCategory} />
</div>
<div class="results-container">
  <div class="filters">
    {#if result && result.length}
      <h4>Sort by Salary</h4>
      <div>
        <input
          type="radio"
          name="salary"
          value="low_low"
          id="low_low"
          checked={sortFilter === 'low_low'}
          on:change={sortBySalary} />
        <label for="low_low">Lowest Low</label>
      </div>
      <div>
        <input
          type="radio"
          name="salary"
          value="high_low"
          id="high_low"
          checked={sortFilter === 'high_low'}
          on:change={sortBySalary} />
        <label for="high_low">Highest Low</label>
      </div>
      <div>
        <input
          type="radio"
          name="salary"
          value="low_high"
          id="low_high"
          checked={sortFilter === 'low_high'}
          on:change={sortBySalary} />
        <label for="low_high">Lowest High</label>
      </div>
      <div>
        <input
          type="radio"
          name="salary"
          value="high_high"
          id="high_high"
          checked={sortFilter === 'high_high'}
          on:change={sortBySalary} />
        <label for="high_high">Highest High</label>
      </div>
      <div>
        <input
          type="radio"
          name="salary"
          value="median_high"
          id="median_high"
          checked={sortFilter === 'median_high'}
          on:change={sortBySalary} />
        <label for="median_high">Highest Median</label>
      </div>
      <div>
        <input
          type="radio"
          name="salary"
          value="median_low"
          id="median_low"
          checked={sortFilter === 'median_low'}
          on:change={sortBySalary} />
        <label for="median_low">Lowest Median</label>
      </div>
      <h4>Locations</h4>
      {#each all_locations as loc, i}
        <div>
          <input
            type="checkbox"
            id={loc}
            value={loc}
            on:change={filterLocation}
            checked={matchFilter(location, loc)} />
          <label for={loc}>
             {loc}
            <span>{jobCount[`loc_${loc}`] || 0}</span>
          </label>
        </div>
      {/each}
      <h4>Categories</h4>
      {#each all_categories as cat, i}
        <div>
          <input
            type="checkbox"
            id={cat}
            value={cat}
            on:change={filterCategory}
            checked={matchFilter(category, cat)} />
          <label for={cat}>
             {cat}
            <span>{jobCount[`cat_${cat}`] || 0}</span>
          </label>
        </div>
      {/each}
    {/if}
  </div>
  <div class="results">
    {#if result}
      <p>
        Found {result.length} results! in {all_jobs.length} during {finishTime}
        milliseconds
      </p>
      <ol>
        {#each result as { job_title, category, location, permanent_high, permanent_low }, i}
          <li>
             {job_title} OF
            <blue>{category}</blue>
            in
            <red>{location}</red>
            for
            <green>{permanent_low}-{permanent_high}</green>
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
