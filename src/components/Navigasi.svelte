<script lang="ts">
    import MiniMap from "./MiniMap.svelte";

    interface Langkah {
        urutan?: number;
        aksi: string;
        detail: string;
        foto?: string;
    }

    interface Rumah {
        id: string;
        nama: string;
        rute_geojson: string;
        koordinat_akhir: [number, number];
        langkah: Langkah[];
    }

    export let namaDusun: string;
    export let rumah: Rumah;
    export let onExit: () => void;

    let currentStep = 0;

    $: langkahList =
        rumah.langkah && rumah.langkah.length > 0
            ? rumah.langkah
            : [
                  {
                      urutan: 1,
                      aksi: "Mulai dari depan Kantor Desa",
                      detail: "Jalan lurus ke arah jalan utama",
                      foto: "/img/kantor_desa1.webp",
                  },
                  {
                      urutan: 2,
                      aksi: `Menuju ${rumah.nama}`,
                      detail: "Ikuti jalur peta mini di atas",
                      foto: "",
                  },
              ];

    $: totalSteps = langkahList.length;
    $: aktif = langkahList[currentStep];

    function next() {
        if (currentStep < totalSteps - 1) {
            currentStep++;
        }
    }

    function prev() {
        if (currentStep > 0) {
            currentStep--;
        }
    }

    function handleImgError(event: Event) {
        const target = event.target as HTMLImageElement;
        target.src =
            "https://images.unsplash.com/photo-1590740608753-ff827f333671?w=800&auto=format&fit=crop&q=80";
    }
</script>

<div class="nav-screen">
    <!-- Header -->
    <header class="header">
        <div class="header-titles">
            <span class="dusun-label">{namaDusun}</span>
            <h1 class="dest-title">{rumah.nama}</h1>
        </div>
        <button
            type="button"
            class="exit-btn"
            on:click={onExit}
            title="Keluar / Ganti Rute"
            aria-label="Keluar / Ganti Rute"
        >
            ✕
        </button>
    </header>

    <div class="divider"></div>

    <!-- Peta Mini (Leaflet Ringan) -->
    <MiniMap
        ruteGeojson={rumah.rute_geojson}
        koordinatAkhir={rumah.koordinat_akhir}
    />

    <!-- Segmented Progress Bar -->
    <div
        class="progress-bar-container"
        aria-label={`Progress langkah ${currentStep + 1} dari ${totalSteps}`}
    >
        {#each Array(totalSteps) as _, i}
            <div class="progress-segment" class:active={i <= currentStep}></div>
        {/each}
    </div>

    <!-- Label Langkah -->
    <div class="step-label">
        Langkah {currentStep + 1} dari {totalSteps}
    </div>

    <!-- Foto Patokan (Fokus Utama) -->
    <div class="photo-frame">
        {#if aktif.foto}
            <img
                src={aktif.foto}
                alt="Foto Patokan Jalan"
                class="photo"
                on:error={handleImgError}
            />
        {:else}
            <div class="photo-placeholder">
                <span class="placeholder-icon">📷</span>
                <span class="placeholder-text">Foto patokan belum diunggah</span
                >
            </div>
        {/if}
    </div>

    <!-- Instruksi 2 Baris Maksimal -->
    <div class="instruction-box">
        <h2 class="action-text">{aktif.aksi}</h2>
        {#if aktif.detail}
            <p class="detail-text">{aktif.detail}</p>
        {/if}
    </div>

    <!-- Tombol Jempol 44px -->
    <div class="btn-group">
        <button
            type="button"
            class="nav-btn btn-prev"
            on:click={prev}
            disabled={currentStep === 0}
        >
            <span class="chevron">←</span>
            <span>Sebelumnya</span>
        </button>

        <button
            type="button"
            class="nav-btn btn-next"
            on:click={next}
            disabled={currentStep === totalSteps - 1}
        >
            <span>Selanjutnya</span>
            <span class="chevron">→</span>
        </button>
    </div>
</div>

<style>
    .nav-screen {
        display: flex;
        flex-direction: column;
        padding: 12px 16px 14px 16px;
        width: 100%;
        height: 100%;
        box-sizing: border-box;
        overflow: hidden; /* Bebas scroll */
    }

    .header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        padding-bottom: 8px;
        flex-shrink: 0;
    }

    .header-titles {
        display: flex;
        flex-direction: column;
    }

    .dusun-label {
        font-size: 12px;
        color: var(--text-muted);
        font-weight: 500;
    }

    .dest-title {
        font-size: 17px;
        font-weight: 700;
        color: var(--text-main);
        margin: 1px 0 0 0;
        letter-spacing: -0.02em;
    }

    .exit-btn {
        width: 32px;
        height: 32px;
        border-radius: 8px;
        border: 1px solid var(--border-color);
        background: var(--bg-card);
        color: var(--text-muted);
        font-size: 13px;
        font-weight: 700;
        display: flex;
        align-items: center;
        justify-content: center;
        transition:
            background 0.15s ease,
            color 0.15s ease;
    }

    .exit-btn:active {
        background: var(--bg-subtle);
        color: var(--text-main);
    }

    .divider {
        height: 1px;
        background: var(--border-color);
        width: 100%;
        margin-bottom: 8px;
        flex-shrink: 0;
    }

    .progress-bar-container {
        display: flex;
        gap: 5px;
        width: 100%;
        margin-bottom: 5px;
        flex-shrink: 0;
    }

    .progress-segment {
        height: 5px;
        flex: 1;
        border-radius: 9999px;
        background: var(--border-color);
        transition: background 0.2s ease;
    }

    .progress-segment.active {
        background: var(--primary-blue);
    }

    .step-label {
        font-size: 12px;
        font-weight: 500;
        color: var(--text-muted);
        margin-bottom: 8px;
        flex-shrink: 0;
    }

    .photo-frame {
        position: relative;
        width: 100%;
        min-width: 0;
        flex: 3; /* Rasio tinggi gambar 3:5 terhadap area visual */
        min-height: 140px;
        border-radius: 14px;
        overflow: hidden;
        background: var(--bg-subtle);
        border: 1px solid var(--border-color);
        margin-bottom: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-sizing: border-box;
    }

    .photo {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
    }

    .photo-placeholder {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        gap: 4px;
        color: var(--text-muted);
        padding: 12px;
        text-align: center;
        box-sizing: border-box;
    }

    .placeholder-icon {
        font-size: 24px;
    }

    .placeholder-text {
        font-size: 12px;
    }

    .instruction-box {
        width: 100%;
        margin-bottom: 10px;
        flex-shrink: 0;
        box-sizing: border-box;
    }

    .action-text {
        font-size: 15px;
        font-weight: 700;
        color: var(--text-main);
        line-height: 1.3;
        margin: 0;
        letter-spacing: -0.01em;
    }

    .detail-text {
        font-size: 12px;
        font-weight: 400;
        color: var(--text-muted);
        line-height: 1.3;
        margin: 2px 0 0 0;
    }

    .btn-group {
        width: 100%;
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
        margin-top: auto; /* Selalu berada di bagian paling bawah layar */
        flex-shrink: 0;
        box-sizing: border-box;
    }

    .nav-btn {
        height: 44px;
        border-radius: 12px;
        font-size: 14px;
        font-weight: 600;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        transition:
            transform 0.1s ease,
            background 0.15s ease,
            opacity 0.15s ease;
        box-sizing: border-box;
    }

    .btn-prev {
        background: var(--bg-card);
        border: 1px solid var(--border-color);
        color: var(--text-main);
    }

    .btn-prev:active:not(:disabled) {
        transform: scale(0.97);
        background: var(--bg-subtle);
    }

    .btn-next {
        background: var(--btn-dark);
        border: 1px solid var(--btn-dark);
        color: var(--btn-dark-text);
    }

    .btn-next:active:not(:disabled) {
        transform: scale(0.97);
        background: var(--btn-dark-hover);
    }

    .nav-btn:disabled {
        opacity: 0.35;
        cursor: not-allowed;
        pointer-events: none;
    }

    .chevron {
        font-size: 15px;
    }
</style>
