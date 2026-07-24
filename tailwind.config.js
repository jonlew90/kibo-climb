/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        kibo: {
          orange: '#FF6B35',
          'orange-dark': '#E0531F',
          teal: '#00A896',
          'teal-dark': '#028090',
          yellow: '#F7B801',
          purple: '#6C5CE7',
          'purple-dark': '#5A4AD1',
          bg: '#FFFDF9',
          card: '#FFFFFF',
          dark: '#1E293B',
        }
      },
      fontFamily: {
        sans: ['Fredoka', 'Quicksand', 'Nunito', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'bouncy': '0 6px 0 0 rgba(0,0,0,0.15)',
        'bouncy-orange': '0 6px 0 0 #C44314',
        'bouncy-teal': '0 6px 0 0 #01626E',
        'bouncy-yellow': '0 6px 0 0 #C49200',
        'bouncy-purple': '0 6px 0 0 #4637B0',
        'card-3d': '0 8px 0 0 #E2E8F0',
      },
      animation: {
        'bounce-short': 'bounceShort 0.3s ease-in-out',
        'shake': 'shake 0.4s cubic-bezier(.36,.07,.19,.97) both',
        'pop': 'pop 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275) both',
        'pulse-glow': 'pulseGlow 2s infinite',
      },
      keyframes: {
        bounceShort: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' }
        },
        shake: {
          '10%, 90%': { transform: 'translateX(-3px)' },
          '20%, 80%': { transform: 'translateX(4px)' },
          '30%, 50%, 70%': { transform: 'translateX(-6px)' },
          '40%, 60%': { transform: 'translateX(6px)' }
        },
        pop: {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' }
        },
        pulseGlow: {
          '0%, 100%': { filter: 'drop-shadow(0 0 15px rgba(255, 107, 53, 0.4))' },
          '50%': { filter: 'drop-shadow(0 0 25px rgba(0, 168, 150, 0.6))' }
        }
      }
    },
  },
  plugins: [],
}
