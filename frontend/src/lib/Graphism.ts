export interface GraphismOptions {
    canvas: HTMLCanvasElement;
    canvasWidth?: number;
    canvasHeight?: number;
    particleCount?: number;
    connectionDistance?: number;
    mouseDistance?: number;
    color?: string;
}

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
}

export class Graphism {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private width: number = 0;
    private height: number = 0;
    private particles: Particle[] = [];
    private options: Required<Omit<GraphismOptions, 'canvas'>>;
    private animationId: number | null = null;
    private mousePromise: { x: number; y: number } | null = null;

    constructor(options: GraphismOptions) {
        this.canvas = options.canvas;
        this.ctx = this.canvas.getContext('2d')!;
        this.options = {
            canvasWidth: window.innerWidth,
            canvasHeight: window.innerHeight,
            particleCount: 80,
            connectionDistance: 150,
            mouseDistance: 200,
            color: '100, 116, 139', // Slate-500 equivalent
            ...options
        };

        this.resize(this.options.canvasWidth, this.options.canvasHeight);
        this.initParticles();
        this.setupEventListeners();
        this.animate();
    }

    private setupEventListeners() {
        window.addEventListener('resize', this.handleResize);
        window.addEventListener('mousemove', this.handleMouseMove);
    }

    private handleResize = () => {
        this.resize(window.innerWidth, window.innerHeight);
        this.initParticles(); // Re-init to fill new space
    };

    private handleMouseMove = (e: MouseEvent) => {
        this.mousePromise = { x: e.clientX, y: e.clientY };
    };

    private resize(width: number, height: number) {
        this.width = width;
        this.height = height;
        this.canvas.width = width;
        this.canvas.height = height;
        this.canvas.style.width = `${width}px`;
        this.canvas.style.height = `${height}px`;
    }

    private initParticles() {
        this.particles = [];
        const count = Math.floor((this.width * this.height) / 15000); // Responsive count
        const particleCount = Math.min(count, this.options.particleCount * 2);

        for (let i = 0; i < particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                size: Math.random() * 2 + 1
            });
        }
    }

    private drawParticles() {
        this.ctx.clearRect(0, 0, this.width, this.height);

        for (let i = 0; i < this.particles.length; i++) {
            const p = this.particles[i];

            // Move
            p.x += p.vx;
            p.y += p.vy;

            // Bounce
            if (p.x < 0 || p.x > this.width) p.vx *= -1;
            if (p.y < 0 || p.y > this.height) p.vy *= -1;

            // Mouse interaction
            if (this.mousePromise) {
                const dx = this.mousePromise.x - p.x;
                const dy = this.mousePromise.y - p.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < this.options.mouseDistance) {
                    const forceDirectionX = dx / distance;
                    const forceDirectionY = dy / distance;
                    const force = (this.options.mouseDistance - distance) / this.options.mouseDistance;
                    const directionX = forceDirectionX * force * 1.5; // Push away slightly
                    const directionY = forceDirectionY * force * 1.5;

                    // Subtle attraction or repulsion - let's do repulsion for "tech" feel
                    // Actually, let's do a gentle attraction to make it feel interactive
                    // p.vx += directionX * 0.05;
                    // p.vy += directionY * 0.05;

                    // Let's do a connector to mouse
                    this.ctx.beginPath();
                    this.ctx.strokeStyle = `rgba(${this.options.color}, ${0.5 - distance / this.options.mouseDistance})`;
                    this.ctx.lineWidth = 1;
                    this.ctx.moveTo(p.x, p.y);
                    this.ctx.lineTo(this.mousePromise.x, this.mousePromise.y);
                    this.ctx.stroke();
                }
            }

            // Draw Particle
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(${this.options.color}, 0.5)`;
            this.ctx.fill();

            // Connect
            for (let j = i + 1; j < this.particles.length; j++) {
                const p2 = this.particles[j];
                const dx = p.x - p2.x;
                const dy = p.y - p2.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < this.options.connectionDistance) {
                    this.ctx.beginPath();
                    this.ctx.strokeStyle = `rgba(${this.options.color}, ${1 - distance / this.options.connectionDistance})`;
                    this.ctx.lineWidth = 1;
                    this.ctx.moveTo(p.x, p.y);
                    this.ctx.lineTo(p2.x, p2.y);
                    this.ctx.stroke();
                }
            }
        }
    }

    private animate = () => {
        this.drawParticles();
        this.animationId = requestAnimationFrame(this.animate);
    };

    public destroy() {
        if (this.animationId) cancelAnimationFrame(this.animationId);
        window.removeEventListener('resize', this.handleResize);
        window.removeEventListener('mousemove', this.handleMouseMove);
    }
}
