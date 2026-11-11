module "worker_queue" {
  source = "./modules/sqs_queue"

  for_each   = toset(local.queue_names)
  queue_name = "worker-${each.key}"
}
