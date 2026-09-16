<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { createEventDispatcher } from "svelte";
  import "leaflet/dist/leaflet.css";
  import L from "leaflet";

  export let ruteGeojson: string;
  export let koordinatAkhir: [number, number];
  export let targetKoordinat: [number, number] | null = null;
  export let stepIndex: number = 0;

  const dispatch = createEventDispatcher<{ autoAdvance: void }>();

  const PROXIMITY_RADIUS = 18;
  const DEBOUNCE_MS = 2500;

  let mapContainer: HTMLElement;
  let map: L.Map | null = null;
  let ruteLayer: L.GeoJSON | null = null;
  let userMarker: L.Marker | null = null;
  let accuracyCircle: L.Circle | null = null;

  let userLatLng: [number, number] | null = null;
  let isFollowingUser = true;
  let gpsActive = false;
  let gpsAccuracy: number | null = null;

  let proximityTimer: ReturnType<typeof setTimeout> | null = null;
  let inProximity = false;
  let advanceMarker: L.Marker | null = null;

  function haversine(a: [number, number], b: [number, number]): number {
    const R = 6371000;
    const toRad = (d: number) => (d * Math.PI) / 180;
    const dLat = toRad(b[0] - a[0]);
    const dLon = toRad(b[1] - a[1]);
    const x =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(a[0])) * Math.cos(toRad(b[0])) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
  }

  function showAdvanceBlink(pos: [number, number]) {
    if (!map) return;
    if (advanceMarker) {
      map.removeLayer(advanceMarker);
      advanceMarker = null;
    }
    const icon = L.divIcon({
      className: "advance-indicator",
      html: '<div class="advance-dot"></div>',
      iconSize: [16, 16],
      iconAnchor: [8, 8],
    });
    advanceMarker = L.marker(pos, { icon, zIndexOffset: 999 }).addTo(map);
    setTimeout(() => {
      if (advanceMarker && map) {
        map.removeLayer(advanceMarker);
        advanceMarker = null;
      }
    }, 1500);
  }

  function checkProximity(pos: [number, number]) {
    if (!targetKoordinat) return;
    const dist = haversine(pos, targetKoordinat);
    if (dist <= PROXIMITY_RADIUS) {
      if (!inProximity) {
        inProximity = true;
        proximityTimer = setTimeout(() => {
          dispatch("autoAdvance");
          showAdvanceBlink(targetKoordinat!);
          inProximity = false;
          proximityTimer = null;
        }, DEBOUNCE_MS);
      }
    } else {
      if (proximityTimer) {
        clearTimeout(proximityTimer);
        proximityTimer = null;
      }
      inProximity = false;
    }
  }

  $: if (stepIndex !== undefined) {
    if (proximityTimer) {
      clearTimeout(proximityTimer);
      proximityTimer = null;
    }
    inProximity = false;
  }

  async function loadMapData() {
    if (!map || !ruteGeojson) return;

    try {
      if (ruteLayer) {
        map.removeLayer(ruteLayer);
      }

      const res = await fetch(`/${ruteGeojson}`);
      if (!res.ok) throw new Error(`Gagal memuat ${ruteGeojson}`);
      const geoData = await res.json();

      ruteLayer = L.geoJSON(geoData, {
        style: {
          color: "#1e40af",
          weight: 4,
          opacity: 0.9,
          dashArray: "5, 5"
        }
      }).addTo(map);

      // Jika belum ada posisi GPS pengguna, sesuaikan peta ke keseluruhan rute
      if (!userLatLng) {
        map.fitBounds(ruteLayer.getBounds(), { padding: [16, 16] });
      }

      // Start coordinate from GeoJSON
      const firstCoord = geoData.features?.[0]?.geometry?.coordinates?.[0];
      if (firstCoord) {
        const startLatLng: [number, number] = [firstCoord[1], firstCoord[0]];
        const startIcon = L.divIcon({
          className: "custom-start-marker",
          html: "<div class=\"start-pill\"><span class=\"dot\"></span><span>Kantor desa</span></div>",
          iconSize: [85, 24],
          iconAnchor: [12, 12]
        });
        L.marker(startLatLng, { icon: startIcon, interactive: false }).addTo(map);
      }

      // End coordinate marker
      if (koordinatAkhir && koordinatAkhir.length === 2) {
        L.circleMarker(koordinatAkhir, {
          radius: 5,
          color: "#dc2626",
          fillColor: "#ef4444",
          fillOpacity: 1,
          weight: 2
        }).addTo(map);
      }

      setTimeout(() => {
        map?.invalidateSize();
      }, 50);
    } catch (err) {
      console.warn("Gagal memuat rute pada MiniMap:", err);
    }
  }

  function setupLocationTracking(leafletMap: L.Map) {
    // Mulai live geolocation tracking
    leafletMap.locate({
      watch: true,
      enableHighAccuracy: true,
      maximumAge: 3000,
      timeout: 10000
    });

    leafletMap.on("locationfound", (e: L.LocationEvent) => {
      gpsActive = true;
      gpsAccuracy = Math.round(e.accuracy);
      const latlng: [number, number] = [e.latlng.lat, e.latlng.lng];
      userLatLng = latlng;

      checkProximity(latlng);

      // Marker posisi pengguna (dot biru dengan pulse)
      if (!userMarker) {
        const userIcon = L.divIcon({
          className: "custom-user-marker",
          html: '<div class="user-pulse"></div><div class="user-dot"></div>',
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });
        userMarker = L.marker(latlng, { icon: userIcon, zIndexOffset: 1000 }).addTo(leafletMap);
      } else {
        userMarker.setLatLng(latlng);
      }

      // Lingkaran akurasi GPS
      if (!accuracyCircle) {
        accuracyCircle = L.circle(latlng, {
          radius: e.accuracy,
          weight: 1,
          color: "#3b82f6",
          fillColor: "#60a5fa",
          fillOpacity: 0.12
        }).addTo(leafletMap);
      } else {
        accuracyCircle.setLatLng(latlng);
        accuracyCircle.setRadius(e.accuracy);
      }

      // Mengikuti pergerakan pengguna secara otomatis jika mode follow aktif
      if (isFollowingUser) {
        const targetZoom = Math.max(leafletMap.getZoom(), 16);
        leafletMap.setView(latlng, targetZoom, { animate: true });
      }
    });

    leafletMap.on("locationerror", (e: L.ErrorEvent) => {
      console.warn("Pemberitahuan Geolocation:", e.message);
      gpsActive = false;
    });

    // Jika pengguna menggeser peta secara manual, jeda auto-follow
    leafletMap.on("dragstart", () => {
      isFollowingUser = false;
    });
  }

  function recenterUser() {
    isFollowingUser = true;
    if (userLatLng && map) {
      const zoom = Math.max(map.getZoom(), 16);
      map.setView(userLatLng, zoom, { animate: true });
    } else if (map) {
      map.locate({ setView: true, maxZoom: 17, enableHighAccuracy: true });
    }
  }

  function fitOverviewRoute() {
    isFollowingUser = false;
    if (ruteLayer && map) {
      map.fitBounds(ruteLayer.getBounds(), { padding: [16, 16], animate: true });
    }
  }

  let resizeObserver: ResizeObserver | null = null;

  onMount(() => {
    map = L.map(mapContainer, {
      zoomControl: true,
      attributionControl: true,
      dragging: true,
      touchZoom: true,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      boxZoom: false,
      keyboard: false
    }).setView([-5.558, 119.997], 15);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      opacity: 0.75,
      attribution: "@ OpenStreetMap"
    }).addTo(map);

    loadMapData();
    setupLocationTracking(map);

    if (typeof ResizeObserver !== "undefined" && mapContainer) {
      resizeObserver = new ResizeObserver(() => {
        map?.invalidateSize();
      });
      resizeObserver.observe(mapContainer);
    }
  });

  onDestroy(() => {
    resizeObserver?.disconnect();
    if (proximityTimer) clearTimeout(proximityTimer);
    if (map) {
      map.stopLocate();
      map.remove();
      map = null;
    }
  });

  $: if (map && ruteGeojson) {
    loadMapData();
  }
</script>

<div class="minimap-wrapper">
  <div bind:this={mapContainer} class="minimap-canvas"></div>

  <!-- Indikator GPS / Status Pelacakan -->
  <div class="minimap-status">
    {#if gpsActive}
      <span class="status-badge gps-ok">
        <span class="pulse-dot"></span>
        <span>GPS {gpsAccuracy ? `(±${gpsAccuracy}m)` : "Aktif"}</span>
      </span>
    {:else}
      <span class="status-badge gps-searching">
        <span>Mencari GPS...</span>
      </span>
    {/if}
  </div>

  <!-- Tombol Aksi Peta (Pusatkan ke Saya & Ikhtisar Rute) -->
  <div class="map-controls">
    <button 
      type="button" 
      class="ctrl-btn" 
      class:active={isFollowingUser}
      on:click={recenterUser} 
      title={isFollowingUser ? "Mengikuti posisi Anda" : "Pusatkan ke lokasi saya"}
      aria-label="Pusatkan ke lokasi saya"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="3"/>
        <path d="M12 2v4M12 18v4M2 12h4M18 12h4"/>
      </svg>
    </button>
    <button 
      type="button" 
      class="ctrl-btn" 
      on:click={fitOverviewRoute} 
      title="Lihat seluruh rute"
      aria-label="Lihat seluruh rute"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 17l6-6-6-6"/>
        <path d="M10 17l6-6-6-6"/>
      </svg>
    </button>
  </div>
</div>

<style>
  .minimap-wrapper {
    position: relative;
    width: 100%;
    min-width: 0;
    flex: 2; /* Rasio tinggi peta 2:5 terhadap area visual */
    min-height: 100px;
    border-radius: 12px;
    overflow: hidden;
    border: 1px solid var(--border-color);
    background: #f1f5f9;
    box-sizing: border-box;
    margin-bottom: 8px;
    display: flex;
    flex-direction: column;
  }

  .minimap-canvas {
    width: 100%;
    height: 100%;
    flex: 1;
    z-index: 1;
  }

  .minimap-status {
    position: absolute;
    top: 6px;
    left: 6px;
    z-index: 2;
    pointer-events: none;
  }

  .status-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 10px;
    font-weight: 600;
    padding: 3px 7px;
    border-radius: 6px;
    backdrop-filter: blur(4px);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .gps-ok {
    background: rgba(16, 185, 129, 0.9);
    color: #ffffff;
  }

  .gps-searching {
    background: rgba(255, 255, 255, 0.85);
    color: var(--text-muted);
    border: 1px solid var(--border-color);
  }

  .pulse-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #ffffff;
    animation: pulseGps 1.5s infinite;
  }

  @keyframes pulseGps {
    0% { transform: scale(0.9); opacity: 0.9; }
    50% { transform: scale(1.3); opacity: 0.4; }
    100% { transform: scale(0.9); opacity: 0.9; }
  }

  .map-controls {
    position: absolute;
    bottom: 25px;
    right: 6px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    z-index: 2;
  }

  .ctrl-btn {
    width: 30px;
    height: 30px;
    border-radius: 8px;
    border: 1px solid var(--border-color);
    background: rgba(255, 255, 255, 0.92);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
    transition: transform 0.1s ease, background 0.15s ease;
  }

  .ctrl-btn:active {
    transform: scale(0.92);
  }

  .ctrl-btn.active {
    background: #2563eb;
    border-color: #1d4ed8;
    box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.3);
  }

  /* Styling Marker Awal Kantor Desa */
  :global(.custom-start-marker) {
    background: transparent;
    border: none;
  }

  :global(.start-pill) {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    background: #ffffff;
    border: 1px solid #cbd5e1;
    border-radius: 9999px;
    padding: 2px 7px;
    font-size: 10px;
    font-weight: 600;
    color: #1e293b;
    box-shadow: 0 1px 3px rgba(0,0,0,0.12);
    white-space: nowrap;
  }

  :global(.start-pill .dot) {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: #475569;
  }

  /* Styling Marker Posisi Pengguna (Live GPS Marker) */
  :global(.custom-user-marker) {
    background: transparent;
    border: none;
    position: relative;
  }

  :global(.user-dot) {
    width: 14px;
    height: 14px;
    background-color: #2563eb;
    border: 2.5px solid #ffffff;
    border-radius: 50%;
    box-shadow: 0 1px 5px rgba(0, 0, 0, 0.35);
    position: absolute;
    top: 5px;
    left: 5px;
    z-index: 2;
  }

  :global(.user-pulse) {
    width: 24px;
    height: 24px;
    background-color: rgba(37, 99, 235, 0.35);
    border-radius: 50%;
    position: absolute;
    top: 0;
    left: 0;
    animation: userPulseRing 1.8s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
  }

  @keyframes userPulseRing {
    0% { transform: scale(0.6); opacity: 0.9; }
    100% { transform: scale(1.6); opacity: 0; }
  }

  /* Advance Indicator */
  :global(.advance-indicator) {
    background: transparent;
    border: none;
  }

  :global(.advance-dot) {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: #3b82f6;
    border: 2px solid #ffffff;
    box-shadow: 0 0 8px rgba(59, 130, 246, 0.6);
    animation: advancePulse 0.6s ease-in-out 2;
  }

  @keyframes advancePulse {
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.5); opacity: 0.5; }
  }
</style>
