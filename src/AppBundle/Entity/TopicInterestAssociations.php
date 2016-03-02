<?php

namespace AppBundle\Entity;

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
     * @var \AppBundle\Entity\DynamicTopics
     */
    private $topicId;

    /**
     * @var \AppBundle\Entity\InterestTable
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
     * @param \AppBundle\Entity\DynamicTopics $topicId
     *
     * @return TopicInterestAssociations
     */
    public function setTopicId(\AppBundle\Entity\DynamicTopics $topicId = null)
    {
        $this->topicId = $topicId;

        return $this;
    }

    /**
     * Get topicId
     *
     * @return \AppBundle\Entity\DynamicTopics
     */
    public function getTopicId()
    {
        return $this->topicId;
    }

    /**
     * Set interestId
     *
     * @param \AppBundle\Entity\InterestTable $interestId
     *
     * @return TopicInterestAssociations
     */
    public function setInterestId(\AppBundle\Entity\InterestTable $interestId = null)
    {
        $this->interestId = $interestId;

        return $this;
    }

    /**
     * Get interestId
     *
     * @return \AppBundle\Entity\InterestTable
     */
    public function getInterestId()
    {
        return $this->interestId;
    }
}
