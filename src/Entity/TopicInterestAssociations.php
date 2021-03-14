<?php

namespace App\Entity;

/**
 * TopicInterestAssociations
 */
class TopicInterestAssociations
{
    /**
     * @var string
     */
    private $affinity;

    /**
     * @var \App\Entity\DynamicTopics
     */
    private $topicId;

    /**
     * @var \App\Entity\InterestTable
     */
    private $interestId;


    /**
     * Set affinity
     *
     * @param string $affinity
     *
     * @return TopicInterestAssociations
     */
    public function setAffinity($affinity)
    {
        $this->affinity = $affinity;

        return $this;
    }

    /**
     * Get affinity
     *
     * @return string
     */
    public function getAffinity()
    {
        return $this->affinity;
    }

    /**
     * Set topicId
     *
     * @param \App\Entity\DynamicTopics $topicId
     *
     * @return TopicInterestAssociations
     */
    public function setTopicId(\App\Entity\DynamicTopics $topicId = null)
    {
        $this->topicId = $topicId;

        return $this;
    }

    /**
     * Get topicId
     *
     * @return \App\Entity\DynamicTopics
     */
    public function getTopicId()
    {
        return $this->topicId;
    }

    /**
     * Set interestId
     *
     * @param \App\Entity\InterestTable $interestId
     *
     * @return TopicInterestAssociations
     */
    public function setInterestId(\App\Entity\InterestTable $interestId = null)
    {
        $this->interestId = $interestId;

        return $this;
    }

    /**
     * Get interestId
     *
     * @return \App\Entity\InterestTable
     */
    public function getInterestId()
    {
        return $this->interestId;
    }
}
