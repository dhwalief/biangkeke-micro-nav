<script lang="ts">
  import { onMount } from "svelte";
  import DusunSelect from "./components/DusunSelect.svelte";
  import Navigasi from "./components/Navigasi.svelte";

  type Screen = "dusun" | "navigasi";

  let dusunList: any[] = [];
  let loading = true;
  let currentScreen: Screen = "dusun";
  let selectedDusun: any = null;
  let selectedRumah: any = null;

  onMount(async () => {
    try {
      let res = await fetch("/data.json");
      if (!res.ok) {
        res = await fetch("/destinasi.json");
      }
      const data = await res.json();
      dusunList = data.dusun || [];
    } catch (err) {
      console.error("Gagal mengambil data dusun:", err);
    } finally {
      loading = false;
    }
  });

  function handleSelectDusun(dusun: any) {
    selectedDusun = dusun;
    selectedRumah = dusun.rumah && dusun.rumah.length > 0 ? dusun.rumah[0] : null;
    currentScreen = "navigasi";
  }

  function handleExitToDusun() {
    currentScreen = "dusun";
  }
</script>

<main class="app-layout">
  <div class="mobile-viewport">
    {#if loading}
      <div class="loading-state">
        <div class="spinner"></div>
        <p>Memuat navigasi desa...</p>
      </div>
    {:else if currentScreen === "dusun"}
      <DusunSelect 
        {dusunList} 
        onSelect={handleSelectDusun} 
      />
    {:else if currentScreen === "navigasi" && selectedDusun && selectedRumah}
      <Navigasi 
        namaDusun={selectedDusun.nama} 
        rumah={selectedRumah} 
        onExit={handleExitToDusun} 
      />
    {/if}
  </div>
</main>

<style>
  .app-layout {
    width: 100vw;
    height: 100vh;
    height: 100dvh;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: var(--bg-app);
    overflow: hidden;
  }

  .mobile-viewport {
    width: 100%;
    max-width: 440px;
    height: 100%;
    height: 100dvh;
    background-color: var(--bg-card);
    display: flex;
    flex-direction: column;
    align-items: stretch;
    position: relative;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
    overflow: hidden;
  }

  @media (min-width: 480px) {
    .mobile-viewport {
      height: 92vh;
      max-height: 840px;
      border-radius: 28px;
      border: 1px solid var(--border-color);
      overflow: hidden;
    }
  }

  .loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    gap: 12px;
    color: var(--text-muted);
    font-size: 14px;
  }

  .spinner {
    width: 28px;
    height: 28px;
    border: 3px solid var(--border-color);
    border-top-color: var(--primary-blue);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
</style>
