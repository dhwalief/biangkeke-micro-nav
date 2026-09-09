<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import "leaflet/dist/leaflet.css";
  import L from "leaflet";

  export let ruteGeojson: string;
  export let koordinatAkhir: [number, number];

  let mapContainer: HTMLElement;
  let map: L.Map | null = null;
  let ruteLayer: L.GeoJSON | null = null;

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

      map.fitBounds(ruteLayer.getBounds(), { padding: [16, 16] });

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
    } catch (err) {
      console.warn("Gagal memuat rute pada MiniMap:", err);
    }
  }

  onMount(() => {
    map = L.map(mapContainer, {
      zoomControl: false,
      attributionControl: false,
      dragging: false,
      touchZoom: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      boxZoom: false,
      keyboard: false
    }).setView([-5.558, 119.997], 15);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      opacity: 0.75
    }).addTo(map);

    loadMapData();
  });

  onDestroy(() => {
    if (map) {
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
  <div class="minimap-tag">Peta Mini</div>
</div>

<style>
  .minimap-wrapper {
    position: relative;
    width: 100%;
    height: 90px;
    border-radius: 12px;
    overflow: hidden;
    border: 1px solid var(--border-color);
    background: #f1f5f9;
    box-sizing: border-box;
    margin-bottom: 10px;
    flex-shrink: 0;
  }

  .minimap-canvas {
    width: 100%;
    height: 100%;
    z-index: 1;
  }

  .minimap-tag {
    position: absolute;
    top: 6px;
    right: 6px;
    background: rgba(255, 255, 255, 0.9);
    border: 1px solid var(--border-color);
    font-size: 10px;
    font-weight: 500;
    color: var(--text-muted);
    padding: 2px 6px;
    border-radius: 6px;
    z-index: 2;
    backdrop-filter: blur(4px);
    pointer-events: none;
  }

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
</style>
