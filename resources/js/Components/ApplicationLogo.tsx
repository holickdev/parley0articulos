import { ImgHTMLAttributes } from 'react';

export default function ApplicationLogo(props: ImgHTMLAttributes<HTMLImageElement>) {
    return (
        <img
            {...props}
            src="/logo.webp"
            alt="Logo Parley Toros Coleados"
            style={{
                borderRadius: '50%',
                objectFit: 'cover',
                ...props.style
            }}
        />
    );
}
