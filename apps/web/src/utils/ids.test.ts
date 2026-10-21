import { describe, expect, it } from 'vitest';
import { assignIds, getItemId, moveItemById, stripIds, withId } from './ids';

describe('withId / getItemId', () => {
  it('ID가 없으면 부여하고, 있으면 유지한다', () => {
    const item = withId({ name: 'a' });
    expect(getItemId(item)).not.toBe('');
    expect(withId(item)).toBe(item);
  });

  it('ID가 없으면 빈 문자열', () => {
    expect(getItemId({ name: 'a' })).toBe('');
  });
});

describe('assignIds', () => {
  const data = {
    profile: { name: '홍길동' },
    skills: { languages: ['TypeScript'] },
    experience: [
      {
        company: 'A',
        projects: [{ name: 'P1', tasks: [{ title: 'T', items: ['x'] }] }],
      },
      { company: 'B', projects: [] },
    ],
  };

  it('객체 배열의 모든 항목(중첩 포함)에 고유 ID를 부여한다', () => {
    const result = assignIds(data);
    const [first, second] = result.experience;

    expect(getItemId(first)).not.toBe('');
    expect(getItemId(second)).not.toBe(getItemId(first));
    expect(getItemId(first.projects[0])).not.toBe('');
    expect(getItemId(first.projects[0].tasks[0])).not.toBe('');
  });

  it('배열이 아닌 객체와 문자열 배열은 건드리지 않는다', () => {
    const result = assignIds(data);
    expect(getItemId(result.profile)).toBe('');
    expect(result.skills.languages).toEqual(['TypeScript']);
  });

  it('원본을 변경하지 않고, 기존 ID는 유지한다', () => {
    const withExisting = { list: [{ _id: 'keep', name: 'a' }] };
    const result = assignIds(withExisting);
    expect(getItemId(result.list[0])).toBe('keep');
    expect(getItemId(data.experience[0])).toBe('');
  });
});

describe('stripIds', () => {
  it('assignIds로 부여한 ID를 모두 제거해 원본과 같아진다', () => {
    const data = { a: [{ b: [{ c: 1 }] }], d: ['x'] };
    expect(stripIds(assignIds(data))).toEqual(data);
  });
});

describe('moveItemById', () => {
  const items = [{ _id: 'a' }, { _id: 'b' }, { _id: 'c' }];

  it('active 항목을 over 위치로 이동한다', () => {
    expect(moveItemById(items, 'a', 'c')?.map(getItemId)).toEqual(['b', 'c', 'a']);
    expect(moveItemById(items, 'c', 'a')?.map(getItemId)).toEqual(['c', 'a', 'b']);
  });

  it('같은 위치거나 ID를 찾지 못하면 null', () => {
    expect(moveItemById(items, 'a', 'a')).toBeNull();
    expect(moveItemById(items, 'a', 'z')).toBeNull();
  });
});
