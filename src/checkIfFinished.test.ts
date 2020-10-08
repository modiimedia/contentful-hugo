import checkIfFinished from './checkIfFinished';

test('Numbers Match (Pass)', () => {
    const result = checkIfFinished(5, 5);
    expect(result).toBe(true);
});

test("Numbers don't match (fail)", () => {
    const result = checkIfFinished(5, 10);
    expect(result).toBe(false);
});
