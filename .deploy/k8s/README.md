# Kubernetes

Assume the current kubeconfig file is saved as `k8s-silo-kubeconfig.yaml`.

## Verify connectivity

```bash
kubectl --kubeconfig="k8s-silo-kubeconfig.yaml" get nodes
```

## Deploy

- To deploy:

```bash
kubectl --kubeconfig="k8s-silo-kubeconfig.yaml" --context do-sfo2-k8s-silo apply -f k8s-manifest.yaml
```

Note: this assumes a context named `do-sfo2-k8s-silo` already exists.

- To describe the deployment:

```bash
kubectl describe deployment --kubeconfig="k8s-silo-kubeconfig.yaml"
```

- To redeploy (if using updated container images):

```bash
kubectl --kubeconfig="k8s-silo-kubeconfig.yaml" --context do-sfo2-k8s-silo rollout restart -f k8s-manifest.yaml
```

## Monitoring

See <https://marketplace.digitalocean.com/apps/kubernetes-monitoring-stack>

```bash
kubectl --kubeconfig="k8s-silo-kubeconfig.yaml" port-forward svc/kube-prometheus-stack-grafana 8090:80 -n kube-prometheus-stack
```

Your Grafana instance will now be available at <http://localhost:8090>.

Default credentials:

- Username: admin
- Password: prom-operator

Change the password after login.

```bash
kubectl --kubeconfig="k8s-silo-kubeconfig.yaml" port-forward svc/kube-prometheus-stack-prometheus 9090 -n kube-prometheus-stack
```

Your Prometheus instance will now be available at <http://localhost:9090>.

## Links

- [Load Balancers Configs in DO](https://www.digitalocean.com/docs/kubernetes/how-to/configure-load-balancers)
- [K8s Ingress](https://kubernetes.io/docs/concepts/services-networking/ingress/#ingress-controllers)
- [K8s Ingress with Nginx + SSL LetsEncrypt](https://www.digitalocean.com/community/tutorials/how-to-set-up-an-nginx-ingress-with-cert-manager-on-digitalocean-kubernetes)
- [GitHub Actions with DO](https://github.com/do-community/example-doctl-action/blob/master/.github/workflows/workflow.yaml)
