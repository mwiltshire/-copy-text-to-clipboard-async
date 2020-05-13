import copy from '.';

it('uses clipboard API if available', async () => {
  const mockWriteText = jest.fn();
  const mockExecCommand = jest.fn(() => true);
  (global as any).navigator.clipboard = {
    writeText: mockWriteText
  };
  document.execCommand = mockExecCommand;

  await copy('test');

  expect(mockWriteText).toHaveBeenCalledTimes(1);
  expect(mockWriteText).toHaveBeenCalledWith('test');
  expect(mockExecCommand).not.toHaveBeenCalled();
});

it('falls back to execCommand if clipboard API does not exist', async () => {
  const mockExecCommand = jest.fn(() => true);
  (global as any).navigator.clipboard = undefined;
  document.execCommand = mockExecCommand;

  await copy('test');

  expect(mockExecCommand).toHaveBeenCalledTimes(1);
  expect(mockExecCommand).toHaveBeenCalledWith('copy');
});

it('falls back to execCommand if clipboard API rejects', async () => {
  const mockExecCommand = jest.fn(() => true);
  (global as any).navigator.clipboard = {
    writeText: () => Promise.reject()
  };
  (global as any).document.execCommand = mockExecCommand;

  await copy('test');

  expect(mockExecCommand).toHaveBeenCalledTimes(1);
  expect(mockExecCommand).toHaveBeenCalledWith('copy');
});

it('returns rejected promise if execCommand returns false', async () => {
  const mockExecCommand = jest.fn(() => false);
  (global as any).navigator.clipboard = undefined;
  document.execCommand = mockExecCommand;

  await expect(() => copy('test')).rejects.toBe(undefined);
});

it('uses document.body as default target DOM element if execCommand is used', async () => {
  const mockExecCommand = jest.fn(() => true);
  (global as any).navigator.clipboard = undefined;
  document.execCommand = mockExecCommand;

  const mockAppend = jest.fn();
  document.body.append = mockAppend;

  await copy('test');

  expect(mockAppend).toHaveBeenCalledTimes(1);
});

it('uses target option as target DOM element if execCommand is used', async () => {
  const mockExecCommand = jest.fn(() => true);
  (global as any).navigator.clipboard = undefined;
  document.execCommand = mockExecCommand;

  const target = document.createElement('div');
  const mockAppend = jest.fn();
  target.append = mockAppend;
  document.body.appendChild(target);

  await copy('test', { target });

  expect(mockAppend).toHaveBeenCalledTimes(1);
});
