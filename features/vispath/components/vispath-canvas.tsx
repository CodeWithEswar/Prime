"use client";

import { useEffect, useRef, useCallback } from "react";
import type {
  VisPathNode,
  VisPathEdge,
  VisPathTrackId,
  CameraState,
  PhotonParticle,
  AmbientStar,
  Shockwave,
} from "../types";

interface VisPathCanvasProps {
  nodes: VisPathNode[];
  edges: VisPathEdge[];
  selectedTrack: VisPathTrackId;
  selectedNode: VisPathNode | null;
  onSelectNode: (node: VisPathNode) => void;
  isFlowing: boolean;
  camera: CameraState;
  onCameraChange: (camera: CameraState) => void;
}

export function VisPathCanvas({
  nodes,
  edges,
  selectedTrack,
  selectedNode,
  onSelectNode,
  isFlowing,
  camera,
  onCameraChange,
}: VisPathCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Interaction refs
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const cameraRef = useRef<CameraState>(camera);
  useEffect(() => {
    cameraRef.current = camera;
  }, [camera]);

  const targetCameraRef = useRef<CameraState | null>(null);

  const hoveredNodeIdRef = useRef<string | null>(null);

  // Animation particles
  const starsRef = useRef<AmbientStar[]>([]);
  const photonsRef = useRef<PhotonParticle[]>([]);
  const shockwavesRef = useRef<Shockwave[]>([]);
  const animFrameIdRef = useRef<number | null>(null);

  // Initialize ambient stars
  useEffect(() => {
    const stars: AmbientStar[] = [];
    for (let i = 0; i < 120; i++) {
      stars.push({
        x: (Math.random() - 0.5) * 2400,
        y: (Math.random() - 0.5) * 1600,
        size: Math.random() * 1.5 + 0.5,
        baseOpacity: Math.random() * 0.4 + 0.1,
        opacity: Math.random() * 0.4 + 0.1,
        twinklePhase: Math.random() * Math.PI * 2,
        twinkleSpeed: Math.random() * 0.03 + 0.01,
      });
    }
    starsRef.current = stars;
  }, []);

  // Initialize edge photons
  useEffect(() => {
    const photons: PhotonParticle[] = [];
    const activeEdges = edges.filter(
      (e) => selectedTrack === "all" || e.track === selectedTrack
    );

    activeEdges.forEach((edge) => {
      const fromNode = nodes.find((n) => n.id === edge.from);
      const toNode = nodes.find((n) => n.id === edge.to);
      if (!fromNode || !toNode) return;

      const midX = (fromNode.x + toNode.x) / 2;
      const midY = (fromNode.y + toNode.y) / 2;
      const dx = toNode.x - fromNode.x;
      const dy = toNode.y - fromNode.y;
      const curv = edge.curvature ?? 0;
      const controlX = midX - dy * curv;
      const controlY = midY + dx * curv;

      // 2 photons per edge with phase offset
      for (let p = 0; p < 2; p++) {
        photons.push({
          edgeId: edge.id,
          fromX: fromNode.x,
          fromY: fromNode.y,
          toX: toNode.x,
          toY: toNode.y,
          controlX,
          controlY,
          progress: p * 0.5 + Math.random() * 0.2,
          speed: 0.004 + Math.random() * 0.003,
          color: fromNode.color,
          size: 3,
        });
      }
    });

    photonsRef.current = photons;
  }, [edges, nodes, selectedTrack]);

  // Coordinate transforms
  const screenToWorld = useCallback(
    (screenX: number, screenY: number, width: number, height: number) => {
      const { x, y, zoom } = cameraRef.current;
      return {
        x: (screenX - width / 2 - x) / zoom,
        y: (screenY - height / 2 - y) / zoom,
      };
    },
    []
  );

  // Trigger expansion shockwave when selectedNode changes
  useEffect(() => {
    if (selectedNode) {
      shockwavesRef.current.push({
        x: selectedNode.x,
        y: selectedNode.y,
        radius: selectedNode.radius,
        maxRadius: selectedNode.radius * 3.5,
        color: selectedNode.color,
        opacity: 0.9,
      });

      // Smooth camera transition toward node
      targetCameraRef.current = {
        x: -selectedNode.x * 1.15,
        y: -selectedNode.y * 1.15,
        zoom: Math.min(1.4, Math.max(cameraRef.current.zoom, 1.15)),
      };
    }
  }, [selectedNode]);

  // Main Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let isRunning = true;

    const render = () => {
      if (!isRunning) return;

      const dpr = window.devicePixelRatio || 1;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;

      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);

      // Camera lerp
      if (targetCameraRef.current) {
        const cur = cameraRef.current;
        const tgt = targetCameraRef.current;
        cur.x += (tgt.x - cur.x) * 0.08;
        cur.y += (tgt.y - cur.y) * 0.08;
        cur.zoom += (tgt.zoom - cur.zoom) * 0.08;

        if (
          Math.abs(tgt.x - cur.x) < 0.5 &&
          Math.abs(tgt.y - cur.y) < 0.5 &&
          Math.abs(tgt.zoom - cur.zoom) < 0.01
        ) {
          targetCameraRef.current = null;
        }
        onCameraChange({ ...cur });
      }

      const { x: camX, y: camY, zoom } = cameraRef.current;

      // 1. Pure dark canvas background
      ctx.fillStyle = "#030305";
      ctx.fillRect(0, 0, width, height);

      // 2. Ambient Cyber Grid
      ctx.save();
      ctx.translate(width / 2 + camX, height / 2 + camY);
      ctx.scale(zoom, zoom);

      const gridSize = 60;
      const gridRange = 1200;
      ctx.strokeStyle = "rgba(255, 255, 255, 0.02)";
      ctx.lineWidth = 1 / zoom;
      ctx.beginPath();
      for (let gx = -gridRange; gx <= gridRange; gx += gridSize) {
        ctx.moveTo(gx, -gridRange);
        ctx.lineTo(gx, gridRange);
      }
      for (let gy = -gridRange; gy <= gridRange; gy += gridSize) {
        ctx.moveTo(-gridRange, gy);
        ctx.lineTo(gridRange, gy);
      }
      ctx.stroke();

      // 3. Ambient Twinkling Stars
      starsRef.current.forEach((star) => {
        star.twinklePhase += star.twinkleSpeed;
        star.opacity =
          star.baseOpacity + Math.sin(star.twinklePhase) * 0.15;
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0.05, star.opacity)})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // 4. Draw Interconnected Curved Edges (The Swarm Hive)
      const visibleEdges = edges.filter(
        (e) => selectedTrack === "all" || e.track === selectedTrack
      );

      visibleEdges.forEach((edge) => {
        const fromNode = nodes.find((n) => n.id === edge.from);
        const toNode = nodes.find((n) => n.id === edge.to);
        if (!fromNode || !toNode) return;

        const isFilteredOut =
          selectedTrack !== "all" &&
          fromNode.track !== selectedTrack &&
          toNode.track !== selectedTrack;

        const midX = (fromNode.x + toNode.x) / 2;
        const midY = (fromNode.y + toNode.y) / 2;
        const dx = toNode.x - fromNode.x;
        const dy = toNode.y - fromNode.y;
        const curv = edge.curvature ?? 0;
        const controlX = midX - dy * curv;
        const controlY = midY + dx * curv;

        const isConnectedToHovered =
          hoveredNodeIdRef.current === fromNode.id ||
          hoveredNodeIdRef.current === toNode.id;
        const isConnectedToSelected =
          selectedNode?.id === fromNode.id || selectedNode?.id === toNode.id;

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(fromNode.x, fromNode.y);
        ctx.quadraticCurveTo(controlX, controlY, toNode.x, toNode.y);

        if (isConnectedToSelected) {
          ctx.strokeStyle = fromNode.color;
          ctx.lineWidth = 2.5;
          ctx.shadowColor = fromNode.color;
          ctx.shadowBlur = 10;
        } else if (isConnectedToHovered) {
          ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
          ctx.lineWidth = 2;
          ctx.shadowColor = "#FFFFFF";
          ctx.shadowBlur = 6;
        } else {
          ctx.strokeStyle = isFilteredOut
            ? "rgba(255, 255, 255, 0.05)"
            : "rgba(255, 255, 255, 0.15)";
          ctx.lineWidth = 1.2;
        }

        // Cross-track synaptic edges dashed style
        if (fromNode.track !== toNode.track) {
          ctx.setLineDash([4, 4]);
        }

        ctx.stroke();
        ctx.restore();
      });

      // 5. Flowing Photon Particles along active paths
      if (isFlowing) {
        photonsRef.current.forEach((photon) => {
          photon.progress += photon.speed;
          if (photon.progress > 1) {
            photon.progress = 0;
          }

          const t = photon.progress;
          // Quadratic bezier interpolation
          const px =
            (1 - t) * (1 - t) * photon.fromX +
            2 * (1 - t) * t * photon.controlX +
            t * t * photon.toX;
          const py =
            (1 - t) * (1 - t) * photon.fromY +
            2 * (1 - t) * t * photon.controlY +
            t * t * photon.toY;

          ctx.save();
          ctx.fillStyle = photon.color;
          ctx.shadowColor = photon.color;
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.arc(px, py, photon.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        });
      }

      // 6. Draw Shockwaves
      for (let s = shockwavesRef.current.length - 1; s >= 0; s--) {
        const sw = shockwavesRef.current[s];
        sw.radius += 2.2;
        sw.opacity -= 0.02;

        if (sw.opacity <= 0 || sw.radius >= sw.maxRadius) {
          shockwavesRef.current.splice(s, 1);
          continue;
        }

        ctx.save();
        ctx.strokeStyle = sw.color;
        ctx.globalAlpha = Math.max(0, sw.opacity);
        ctx.lineWidth = 2;
        ctx.shadowColor = sw.color;
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // 7. Draw Nodes
      nodes.forEach((node) => {
        const isTrackActive =
          selectedTrack === "all" || node.track === selectedTrack;
        const isHovered = hoveredNodeIdRef.current === node.id;
        const isSelected = selectedNode?.id === node.id;

        ctx.save();

        // Node Glow halos
        if (isSelected || isHovered) {
          ctx.fillStyle = node.glowColor;
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius + (isSelected ? 16 : 10), 0, Math.PI * 2);
          ctx.fill();
        }

        // Concentric outer ring
        ctx.strokeStyle = isSelected
          ? "#FFFFFF"
          : isHovered
            ? node.color
            : isTrackActive
              ? node.color
              : "rgba(255, 255, 255, 0.2)";
        ctx.lineWidth = isSelected ? 2.5 : 1.5;
        ctx.shadowColor = node.color;
        ctx.shadowBlur = isSelected ? 16 : isHovered ? 10 : 4;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.stroke();

        // Inner solid core
        const grad = ctx.createRadialGradient(
          node.x - node.radius * 0.3,
          node.y - node.radius * 0.3,
          2,
          node.x,
          node.y,
          node.radius
        );
        grad.addColorStop(0, "#1F1F24");
        grad.addColorStop(1, isSelected ? "#140A0A" : "#0A0A0C");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius - 2, 0, Math.PI * 2);
        ctx.fill();

        // Center Indicator (Stage or Checkmark)
        ctx.fillStyle = node.color;
        ctx.font = `bold ${Math.round(11 * (node.radius / 34))}px ui-monospace, monospace`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        if (node.status === "completed") {
          ctx.fillText("✓", node.x, node.y);
        } else {
          ctx.fillText(`S${node.stage}`, node.x, node.y);
        }

        // Floating Title Badge underneath
        ctx.font = "600 11px system-ui, -apple-system, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "top";

        const labelY = node.y + node.radius + 7;
        const labelText = node.title;
        const metrics = ctx.measureText(labelText);
        const padX = 8;
        const padY = 3;

        // Label pill background
        ctx.fillStyle = isSelected
          ? "rgba(255, 255, 255, 0.95)"
          : isHovered
            ? "rgba(20, 20, 24, 0.95)"
            : "rgba(10, 10, 12, 0.85)";
        ctx.strokeStyle = isSelected
          ? "#FFFFFF"
          : isHovered
            ? node.color
            : "rgba(255, 255, 255, 0.1)";
        ctx.lineWidth = 1;

        const pillW = metrics.width + padX * 2;
        const pillH = 18;
        const pillX = node.x - pillW / 2;
        const pillY = labelY;

        ctx.beginPath();
        ctx.roundRect(pillX, pillY, pillW, pillH, 4);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = isSelected ? "#000000" : "#FFFFFF";
        ctx.fillText(labelText, node.x, labelY + padY);

        ctx.restore();
      });

      ctx.restore(); // Restore camera transform
      ctx.restore(); // Restore dpr scale

      animFrameIdRef.current = requestAnimationFrame(render);
    };

    animFrameIdRef.current = requestAnimationFrame(render);

    return () => {
      isRunning = false;
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [nodes, edges, selectedTrack, selectedNode, isFlowing, onCameraChange]);

  // Mouse handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = true;
    dragStartRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (isDraggingRef.current) {
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;
      dragStartRef.current = { x: e.clientX, y: e.clientY };

      const updated = {
        ...cameraRef.current,
        x: cameraRef.current.x + dx,
        y: cameraRef.current.y + dy,
      };
      targetCameraRef.current = null;
      onCameraChange(updated);
      return;
    }

    // Hover detection
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const world = screenToWorld(mouseX, mouseY, canvas.clientWidth, canvas.clientHeight);

    let foundId: string | null = null;
    for (const node of nodes) {
      const dist = Math.hypot(node.x - world.x, node.y - world.y);
      if (dist <= node.radius + 6) {
        foundId = node.id;
        break;
      }
    }

    hoveredNodeIdRef.current = foundId;
    canvas.style.cursor = foundId ? "pointer" : isDraggingRef.current ? "grabbing" : "grab";
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dragDist = Math.hypot(
      e.clientX - dragStartRef.current.x,
      e.clientY - dragStartRef.current.y
    );

    isDraggingRef.current = false;
    canvas.style.cursor = hoveredNodeIdRef.current ? "pointer" : "grab";

    // If it was a click (not a drag)
    if (dragDist < 5) {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const world = screenToWorld(mouseX, mouseY, canvas.clientWidth, canvas.clientHeight);

      for (const node of nodes) {
        const dist = Math.hypot(node.x - world.x, node.y - world.y);
        if (dist <= node.radius + 8) {
          onSelectNode(node);
          break;
        }
      }
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    const curZoom = cameraRef.current.zoom;
    const nextZoom = Math.min(2.5, Math.max(0.4, curZoom * zoomFactor));

    const updated = {
      ...cameraRef.current,
      zoom: nextZoom,
    };
    targetCameraRef.current = null;
    onCameraChange(updated);
  };

  // Touch handlers for mobile / tablet
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 1) {
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 1 && touchStartRef.current) {
      const dx = e.touches[0].clientX - touchStartRef.current.x;
      const dy = e.touches[0].clientY - touchStartRef.current.y;
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };

      const updated = {
        ...cameraRef.current,
        x: cameraRef.current.x + dx,
        y: cameraRef.current.y + dy,
      };
      targetCameraRef.current = null;
      onCameraChange(updated);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !touchStartRef.current) return;

    // Check tap
    const rect = canvas.getBoundingClientRect();
    const touch = e.changedTouches[0];
    const mouseX = touch.clientX - rect.left;
    const mouseY = touch.clientY - rect.top;
    const world = screenToWorld(mouseX, mouseY, canvas.clientWidth, canvas.clientHeight);

    for (const node of nodes) {
      const dist = Math.hypot(node.x - world.x, node.y - world.y);
      if (dist <= node.radius + 12) {
        onSelectNode(node);
        break;
      }
    }
    touchStartRef.current = null;
  };

  return (
    <canvas
      ref={canvasRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="h-full w-full touch-none select-none"
    />
  );
}
