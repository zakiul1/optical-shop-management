export function Icon({ name, className = 'h-5 w-5' }) {
    const icons = {
        dashboard: <path d="M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-9z" />,
        box: <path d="M21 8l-9-5-9 5 9 5 9-5zm0 0v8l-9 5m9-13-9 5m0 8-9-5V8m9 13v-8M3 8l9 5" />,
        tag: <path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8zM7.5 7.5h.01" />,
        plus: <path d="M12 5v14m-7-7h14" />,
        search: <path d="m21 21-4.3-4.3M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15z" />,
        alert: <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0zM12 9v4m0 4h.01" />,
        moon: <path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z" />,
        sun: <path d="M12 1v2m0 18v2M4.2 4.2l1.4 1.4m12.8 12.8 1.4 1.4M1 12h2m18 0h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10z" />,
        menu: <path d="M4 6h16M4 12h16M4 18h16" />,
        edit: <path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />,
        trash: <path d="M3 6h18M8 6V4h8v2m-1 0v14H9V6m1 4v6m4-6v6" />,
        receipt: <path d="M7 3h10a2 2 0 0 1 2 2v16l-3-2-3 2-3-2-3 2-3-2V5a2 2 0 0 1 2-2zm3 6h6M8 13h8M8 17h5" />,
        eye: <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12zm10 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />,
        print: <path d="M6 9V3h12v6M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v7H6v-7z" />,
        user: <path d="M20 21a8 8 0 0 0-16 0M12 13a5 5 0 1 0 0-10 5 5 0 0 0 0 10z" />,
        cart: <path d="M6 6h15l-2 8H8L6 3H3m6 18a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm9 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" />,
        chart: <path d="M4 19V5m0 14h16M8 16v-5m4 5V8m4 8v-9" />,
        calendar: <path d="M8 2v4m8-4v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />,
        download: <path d="M12 3v12m0 0 5-5m-5 5-5-5M4 21h16" />,
        money: <path d="M3 7h18v10H3V7zm3 3h.01M18 14h.01M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />,
        file: <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm0 0v6h6" />,
        trend: <path d="m3 17 6-6 4 4 8-8m0 0h-5m5 0v5" />,
        truck: <path d="M3 7h11v9H3V7zm11 3h3l4 4v2h-7v-6zm-8 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm12 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />,
        swap: <path d="M7 7h12m0 0-4-4m4 4-4 4M17 17H5m0 0 4 4m-4-4 4-4" />,
        users: <path d="M16 21a6 6 0 0 0-12 0M10 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm11 10a5 5 0 0 0-6-4.8M17 3.3a4 4 0 0 1 0 7.4" />,
        bell: <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0" />,
        check: <path d="M20 6 9 17l-5-5" />,
        shield: <path d="M12 2 4 5v6c0 5 3.4 9.3 8 11 4.6-1.7 8-6 8-11V5l-8-3zm-3 10 2 2 4-5" />,
        logout: <path d="M10 17l5-5-5-5m5 5H3m8 9h7a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-7" />,
        lock: <path d="M7 11V8a5 5 0 0 1 10 0v3m-9 0h8a2 2 0 0 1 2 2v7H6v-7a2 2 0 0 1 2-2z" />,
        x: <path d="M18 6 6 18M6 6l12 12" />,
        clock: <path d="M12 8v5l3 2m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />,
        image: <path d="M4 5h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2zm3 9 3-3 4 4 2-2 4 4M8 9h.01" />,
        globe: <path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20" />,
        sparkles: <path d="M12 3l1.7 4.3L18 9l-4.3 1.7L12 15l-1.7-4.3L6 9l4.3-1.7L12 3zm6 10 1 2.5 2.5 1-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1 1-2.5zM5 14l.8 2.2L8 17l-2.2.8L5 20l-.8-2.2L2 17l2.2-.8L5 14z" />,
    };

    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            {icons[name] ?? icons.box}
        </svg>
    );
}
