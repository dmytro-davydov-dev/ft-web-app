const styleProxy = new Proxy<Record<string, string>>(
  {},
  {
    get: (_target, prop) => String(prop),
  }
);

export default styleProxy;
