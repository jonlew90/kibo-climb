import React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import AccountLinkModal from '../src/components/AccountLinkModal';

vi.mock('../src/utils/audio', () => ({
  soundFx: {
    playVictory: vi.fn(),
    playIncorrect: vi.fn(),
    playKeyTap: vi.fn(),
    playSparkCollect: vi.fn(),
    playWhoosh: vi.fn(),
  }
}));

vi.mock('../src/config/firebase', () => ({
  auth: { currentUser: { uid: 'test_uid', isAnonymous: true } },
  db: {}
}));

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(),
  signInAnonymously: vi.fn(),
  onAuthStateChanged: vi.fn(),
  signOut: vi.fn()
}));

vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  setDoc: vi.fn(),
  getDoc: vi.fn(),
  onSnapshot: vi.fn(),
  getFirestore: vi.fn(() => ({})),
  serverTimestamp: vi.fn(() => 'mock_timestamp'),
  collection: vi.fn()
}));

vi.mock('firebase/functions', () => ({
  getFunctions: vi.fn(),
  httpsCallable: vi.fn()
}));

describe('AccountLinkModal Onboarding Login Mode', () => {
  let container;
  let root;

  beforeEach(() => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
    localStorage.clear();
    sessionStorage.clear();
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
    localStorage.clear();
    sessionStorage.clear();
    vi.restoreAllMocks();
  });

  it('renders Save Progress toggle and helper prompt when isLoginOnly is false', () => {
    act(() => {
      root.render(
        <AccountLinkModal
          isOpen={true}
          isLoginOnly={false}
          onClose={vi.fn()}
        />
      );
    });

    const text = container.textContent;
    expect(text).toContain('Save Progress');
    expect(text).toContain('Log In');
    expect(text).toContain('Already have an account? Log In to restore');
  });

  it('does NOT render Save Progress toggle or "First time playing on this device?" when isLoginOnly is true', () => {
    act(() => {
      root.render(
        <AccountLinkModal
          isOpen={true}
          isLoginOnly={true}
          onClose={vi.fn()}
        />
      );
    });

    const text = container.textContent;
    // Should NOT contain the toggle switcher with Save Progress
    expect(text).not.toContain('Save Progress');
    // Should NOT contain the helper prompt for first time playing
    expect(text).not.toContain('First time playing on this device?');
    expect(text).not.toContain('Save progress instead');
    expect(text).not.toContain('Already have an account?');

    // Should contain login modal elements
    expect(text).toContain('Log In');
    expect(text).toContain('Log in with Google');
    expect(text).toContain('Sign in with Apple');
  });
});
