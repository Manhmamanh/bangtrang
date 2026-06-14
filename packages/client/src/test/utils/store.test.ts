import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAuthStore, useBoardStore } from '../../utils/store';

describe('useAuthStore', () => {
  beforeEach(() => {
    useAuthStore.getState().logout();
  });

  it('should have initial state', () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
  });

  it('should login user', () => {
    const { result } = renderHook(() => useAuthStore());

    const mockUser = {
      id: '123',
      email: 'test@example.com',
      fullName: 'Test User',
    };

    act(() => {
      result.current.login(mockUser, 'test-token');
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.token).toBe('test-token');
  });

  it('should logout user', () => {
    const { result } = renderHook(() => useAuthStore());

    const mockUser = {
      id: '123',
      email: 'test@example.com',
      fullName: 'Test User',
    };

    act(() => {
      result.current.login(mockUser, 'test-token');
    });

    expect(result.current.user).not.toBeNull();

    act(() => {
      result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
  });
});

describe('useBoardStore', () => {
  beforeEach(() => {
    useBoardStore.setState({
      currentBoard: null,
      objects: [],
      selectedObjects: [],
    });
  });

  it('should have initial state', () => {
    const state = useBoardStore.getState();
    expect(state.objects).toEqual([]);
    expect(state.selectedObjects).toEqual([]);
  });

  it('should add object', () => {
    const { result } = renderHook(() => useBoardStore());

    const newObject = {
      id: '1',
      boardId: 'board-1',
      type: 'rectangle' as const,
      data: { x: 10, y: 10, width: 100, height: 100 },
      createdBy: 'user-1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    act(() => {
      result.current.addObject(newObject);
    });

    expect(result.current.objects).toHaveLength(1);
    expect(result.current.objects[0]).toEqual(newObject);
  });

  it('should update object', () => {
    const { result } = renderHook(() => useBoardStore());

    const object = {
      id: '1',
      boardId: 'board-1',
      type: 'rectangle' as const,
      data: { x: 10, y: 10 },
      createdBy: 'user-1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    act(() => {
      result.current.addObject(object);
    });

    act(() => {
      result.current.updateObject('1', {
        data: { x: 20, y: 20 },
      });
    });

    expect(result.current.objects[0].data.x).toBe(20);
    expect(result.current.objects[0].data.y).toBe(20);
  });

  it('should delete object', () => {
    const { result } = renderHook(() => useBoardStore());

    const object = {
      id: '1',
      boardId: 'board-1',
      type: 'rectangle' as const,
      data: {},
      createdBy: 'user-1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    act(() => {
      result.current.addObject(object);
    });

    expect(result.current.objects).toHaveLength(1);

    act(() => {
      result.current.deleteObject('1');
    });

    expect(result.current.objects).toHaveLength(0);
  });

  it('should select/deselect object', () => {
    const { result } = renderHook(() => useBoardStore());

    act(() => {
      result.current.selectObject('1');
    });

    expect(result.current.selectedObjects).toContain('1');

    act(() => {
      result.current.selectObject('1');
    });

    expect(result.current.selectedObjects).not.toContain('1');
  });

  it('should deselect all objects', () => {
    const { result } = renderHook(() => useBoardStore());

    act(() => {
      result.current.selectObject('1');
      result.current.selectObject('2');
    });

    expect(result.current.selectedObjects).toHaveLength(2);

    act(() => {
      result.current.deselectAll();
    });

    expect(result.current.selectedObjects).toHaveLength(0);
  });
});
