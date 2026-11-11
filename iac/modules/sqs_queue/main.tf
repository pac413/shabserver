resource "aws_sqs_queue" "queue" {
  name = var.fifo ? "${var.queue_name}.fifo" : var.queue_name

  receive_wait_time_seconds   = 20
  visibility_timeout_seconds  = 120
  delay_seconds               = 0
  message_retention_seconds   = var.message_retention_seconds
  fifo_queue                  = var.fifo
  content_based_deduplication = var.fifo

  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.queue_dlq.arn
    maxReceiveCount     = var.max_receive_count
  })
}

resource "aws_sqs_queue" "queue_dlq" {
  name                        = var.fifo ? "${var.queue_name}_dlq.fifo" : "${var.queue_name}_dlq"
  fifo_queue                  = var.fifo
  content_based_deduplication = var.fifo
}
